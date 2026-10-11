const zlib = require('zlib');

const W=1200,H=630;
const pixels=Buffer.alloc(W*H*4);
function px(x,y,r,g,b,a=255){if(x<0||x>=W||y<0||y>=H)return;const i=(y*W+x)*4;pixels[i]=r;pixels[i+1]=g;pixels[i+2]=b;pixels[i+3]=a}
function rect(x,y,w,h,c){for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)px(xx,yy,...c)}
function fill(c){rect(0,0,W,H,c)}
function roundRect(x,y,w,h,r,c){for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const dx=Math.min(xx,w-1-xx),dy=Math.min(yy,h-1-yy);if(dx>=r||dy>=r||(dx-r)*(dx-r)+(dy-r)*(dy-r)<=r*r)px(x+xx,y+yy,...c)}}

const font={
A:['01110','10001','10001','11111','10001','10001','10001'],
B:['11110','10001','10001','11110','10001','10001','11110'],
D:['11110','10001','10001','10001','10001','10001','11110'],
E:['11111','10000','10000','11110','10000','10000','11111'],
I:['11111','00100','00100','00100','00100','00100','11111'],
L:['10000','10000','10000','10000','10000','10000','11111'],
M:['10001','11011','10101','10101','10001','10001','10001'],
N:['10001','11001','10101','10011','10001','10001','10001'],
O:['01110','10001','10001','10001','10001','10001','01110'],
P:['11110','10001','10001','11110','10000','10000','10000'],
R:['11110','10001','10001','11110','10100','10010','10001'],
T:['11111','00100','00100','00100','00100','00100','00100'],
U:['10001','10001','10001','10001','10001','10001','01110'],
V:['10001','10001','10001','10001','10001','01010','00100'],
G:['01110','10001','10000','10111','10001','10001','01110'],
S:['01111','10000','10000','01110','00001','00001','11110'],
' ':['00000','00000','00000','00000','00000','00000','00000'],
'&':['01000','10100','10100','01000','10101','10010','01101']
};
function text(str,x,y,scale,c,spacing=1){let cx=x;for(const ch of str){const glyph=font[ch]||font[' '];for(let gy=0;gy<7;gy++)for(let gx=0;gx<5;gx++)if(glyph[gy][gx]==='1')rect(cx+gx*scale,y+gy*scale,scale,scale,c);cx+=(5+spacing)*scale}return cx}
function crc32(buf){let c=0xffffffff;for(const b of buf){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0)}return (c^0xffffffff)>>>0}
function chunk(type,data){const t=Buffer.from(type);const len=Buffer.alloc(4);len.writeUInt32BE(data.length);const crc=Buffer.alloc(4);crc.writeUInt32BE(crc32(Buffer.concat([t,data])));return Buffer.concat([len,t,data,crc])}
function png(){const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++){const off=y*(W*4+1);raw[off]=0;pixels.copy(raw,off+1,y*W*4,(y+1)*W*4)}const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(W,0);ihdr.writeUInt32BE(H,4);ihdr[8]=8;ihdr[9]=6;return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(raw,{level:9})),chunk('IEND',Buffer.alloc(0))])}

fill([10,10,12,255]);
for(let i=0;i<420;i++){const a=Math.max(0,1-i/420);rect(W-i-1,0,1,H,[16+Math.round(18*a),15+Math.round(14*a),13+Math.round(8*a),255])}
roundRect(38,38,W-76,H-76,24,[28,27,28,255]);
rect(42,42,W-84,H-84,[10,10,12,255]);
rect(78,92,230,4,[201,165,90,255]);
text('BADR',78,150,28,[245,244,240,255],1);
text('BRAND & MULTIMEDIA DESIGNER',82,382,6,[201,165,90,255],1);
text('PORTFOLIO',82,505,5,[145,143,138,255],1);
text('DESIGN  VIDEO  CREATIVE',690,505,4,[145,143,138,255],1);

module.exports=(req,res)=>{const out=png();res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');res.statusCode=200;res.end(out)};
