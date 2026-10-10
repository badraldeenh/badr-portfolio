"""Exercise the production Lua script with Redis-command doubles via liblua.

This checks update math and idempotency, not hosted Redis concurrency or HTTP.
"""
import ctypes
import ctypes.util
import json
import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[1]
script = subprocess.check_output(['node', '-e', "process.stdout.write(require('./lib/ratings').VOTE_SCRIPT)"], cwd=root).decode()
lua = ctypes.CDLL(ctypes.util.find_library('lua5.4'))
lua.luaL_newstate.restype = ctypes.c_void_p
lua.luaL_openlibs.argtypes = [ctypes.c_void_p]
lua.luaL_loadstring.argtypes = [ctypes.c_void_p, ctypes.c_char_p]
lua.lua_pcallk.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.c_int, ctypes.c_int, ctypes.c_longlong, ctypes.c_void_p]
lua.lua_tolstring.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.POINTER(ctypes.c_size_t)]
lua.lua_tolstring.restype = ctypes.c_char_p
lua.lua_close.argtypes = [ctypes.c_void_p]
state = lua.luaL_newstate()
lua.luaL_openlibs(state)
source = '''
local hashes = {}
local strings = {}
local expiries = {}
redis = {}
function redis.call(command, key, field, value)
  if command == 'HGET' then return (hashes[key] or {})[field] end
  if command == 'HSET' then hashes[key] = hashes[key] or {}; hashes[key][field] = tonumber(value) or value; return 1 end
  if command == 'HINCRBY' then hashes[key] = hashes[key] or {}; hashes[key][field] = (hashes[key][field] or 0) + tonumber(value); return hashes[key][field] end
  if command == 'INCR' then strings[key] = (strings[key] or 0) + 1; return strings[key] end
  if command == 'EXPIRE' then expiries[key] = field; return 1 end
  error('Unexpected Redis command: ' .. command)
end
local function submit(voter, score, limiter)
  KEYS = {'votes', 'stats', limiter or 'limit'}
  ARGV = {voter, score, '1700000000000'}
  local execute = function()
''' + script + '''
  end
  return execute()
end
local first = submit('a', 5)
assert(first[1] == 1 and hashes.stats.count == 1 and hashes.stats.sum == 5)
local duplicate = submit('a', 5)
assert(duplicate[1] == 0 and hashes.stats.count == 1 and strings.limit == 1)
submit('a', 3)
assert(hashes.stats.count == 1 and hashes.stats.sum == 3 and hashes.stats.stars5 == 0 and hashes.stats.stars3 == 1)
submit('b', 1)
assert(hashes.stats.count == 2 and hashes.stats.sum == 4)
strings.blocked = 120
local blocked = submit('c', 5, 'blocked')
assert(blocked[1] == -1 and hashes.votes.c == nil and hashes.stats.count == 2)
assert(expiries.limit == 600)
for iteration = 1, 500 do
  local voter = 'v' .. ((iteration * 7) % 11)
  local score = (iteration * 3) % 5 + 1
  submit(voter, score, 'limit' .. iteration)
  local sum, count, distribution = 0, 0, {0,0,0,0,0}
  for _, score in pairs(hashes.votes) do sum = sum + score; count = count + 1; distribution[score] = distribution[score] + 1 end
  assert(hashes.stats.count == count and hashes.stats.sum == sum)
  for star = 1, 5 do assert((hashes.stats['stars' .. star] or 0) == distribution[star]) end
end
return 'Lua vote checks passed: first vote, retry, edit, second voter, rate limit, and 500 update invariants.'
'''
try:
    result = lua.luaL_loadstring(state, source.encode())
    if result == 0:
        result = lua.lua_pcallk(state, 0, 1, 0, 0, None)
    message = lua.lua_tolstring(state, -1, None)
    if result:
        raise RuntimeError(message.decode() if message else f'Lua error {result}')
    print(message.decode())
finally:
    lua.lua_close(state)
