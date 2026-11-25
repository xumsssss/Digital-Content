(() => {
const canvas = document.getElementById('deviceCanvas');
const status = document.getElementById('modelStatus');
const title = document.getElementById('partTitle');
const description = document.getElementById('partDescription');
const items = [...document.querySelectorAll('.part-item')];
const dial = document.getElementById('dialControl');
const dialValue = document.getElementById('dialValue');
const press = document.getElementById('pressButton');
const feedback = document.getElementById('buttonFeedback');

const descriptions = {
  "Dial":"회전 조작으로 화면의 항목을 선택하고 테이스팅 기록의 수치를 조절합니다. 저장된 주류 목록에서는 커버 플로우 형태로 항목을 탐색합니다.",
  "Button":"선택한 기능을 확정하고 기록을 저장하는 물리 버튼입니다. 홈 화면에서 다이얼로 항목을 선택한 뒤 눌러 실행합니다.",
  "화면":"선택한 기능과 주류 정보, 테이스팅 항목 및 기록 결과를 보여주는 디스플레이입니다. 제품 렌더링 모델에서는 화면을 꺼진 상태로 유지합니다.",
  "Camera":"제품 후면의 카메라로 주류 라벨을 촬영합니다. 촬영한 라벨을 바탕으로 주류 종류와 브랜드 정보를 인식합니다.",
  "LED light":"상단의 곡선형 LED 표시등입니다. 상태와 작동 흐름을 빛으로 전달합니다.",
  "LED Category light 1":"테이스팅 육각 그래프의 해당 항목 또는 추천 부스 방향에 대응하는 LED 구간입니다. 필요한 한 구간만 켜집니다.",
  "LED Category light 2":"테이스팅 육각 그래프의 해당 항목 또는 추천 부스 방향에 대응하는 LED 구간입니다. 필요한 한 구간만 켜집니다.",
  "LED Category light 3":"테이스팅 육각 그래프의 해당 항목 또는 추천 부스 방향에 대응하는 LED 구간입니다. 필요한 한 구간만 켜집니다.",
  "LED Category light 4":"테이스팅 육각 그래프의 해당 항목 또는 추천 부스 방향에 대응하는 LED 구간입니다. 필요한 한 구간만 켜집니다.",
  "LED Category light 5":"테이스팅 육각 그래프의 해당 항목 또는 추천 부스 방향에 대응하는 LED 구간입니다. 필요한 한 구간만 켜집니다.",
  "LED Category light 6":"테이스팅 육각 그래프의 해당 항목 또는 추천 부스 방향에 대응하는 LED 구간입니다. 필요한 한 구간만 켜집니다."
};
let activePart = "Dial", yaw = 0.22, pitch = -0.05, zoom = 15.8, dragging = false, lastX = 0, lastY = 0, dialAngle = 0, buttonPressed = false, gl = null, program = null, meshes = [];

function mat4Identity(){return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);}
function mat4Mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o;}
function perspective(fovy,aspect,near,far){const f=1/Math.tan(fovy/2),nf=1/(near-far),o=new Float32Array(16);o[0]=f/aspect;o[5]=f;o[10]=(far+near)*nf;o[11]=-1;o[14]=2*far*near*nf;return o;}
function rotX(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([1,0,0,0,0,c,s,0,0,-s,c,0,0,0,0,1]);}
function rotY(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,0,0,0,1]);}
function rotZ(a){const c=Math.cos(a),s=Math.sin(a);return new Float32Array([c,s,0,0,-s,c,0,0,0,0,1,0,0,0,0,1]);}
function translate(x,y,z){const m=mat4Identity();m[12]=x;m[13]=y;m[14]=z;return m;}
function resize(){const dpr=Math.min(window.devicePixelRatio||1,2),w=Math.max(1,Math.floor(canvas.clientWidth*dpr)),h=Math.max(1,Math.floor(canvas.clientHeight*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;if(gl)gl.viewport(0,0,w,h);}}
function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
const vs=`attribute vec3 aPosition;attribute vec3 aNormal;uniform mat4 uMVP;uniform mat4 uModel;varying vec3 vNormal;varying vec3 vPos;void main(){vec4 p=uModel*vec4(aPosition,1.0);vPos=p.xyz;vNormal=normalize(mat3(uModel)*aNormal);gl_Position=uMVP*vec4(aPosition,1.0);}`;
const fs=`precision mediump float;uniform vec4 uColor;uniform vec3 uEmissive;uniform float uHighlight;varying vec3 vNormal;varying vec3 vPos;void main(){vec3 n=normalize(vNormal);vec3 light=normalize(vec3(-0.45,0.8,1.0));float diff=max(dot(n,light),0.0);float rim=pow(1.0-max(dot(n,normalize(vec3(0.0,0.0,1.0))),0.0),2.0);vec3 base=uColor.rgb*(0.40+0.68*diff);vec3 spec=vec3(0.18)*pow(max(dot(reflect(-light,n),normalize(vec3(0.0,0.0,1.0))),0.0),22.0);vec3 glow=uEmissive*(0.25+0.75*diff);base=mix(base,vec3(0.72,0.62,0.98),uHighlight*0.48);gl_FragColor=vec4(base+spec+glow+vec3(0.12,0.08,0.2)*rim*uHighlight, uColor.a);}`;
function initGL(){gl=canvas.getContext('webgl',{alpha:true,antialias:true});if(!gl)throw new Error("WebGL을 사용할 수 없습니다.");program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vs));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.enable(gl.CULL_FACE);gl.getExtension("OES_element_index_uint");gl.clearColor(0,0,0,0);}
function getAccessor(doc,bin,index){const a=doc.accessors[index],v=doc.bufferViews[a.bufferView],components={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16}[a.type],bytes={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}[a.componentType],offset=(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||components*bytes,count=a.count,types={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Type=types[a.componentType];let arr;if(stride===components*bytes){arr=new Type(bin,offset,count*components);}else{arr=new Type(count*components);const dv=new DataView(bin);for(let i=0;i<count;i++)for(let j=0;j<components;j++){const p=offset+i*stride+j*bytes;let val=a.componentType===5126?dv.getFloat32(p,true):a.componentType===5125?dv.getUint32(p,true):a.componentType===5123?dv.getUint16(p,true):a.componentType===5122?dv.getInt16(p,true):a.componentType===5121?dv.getUint8(p):dv.getInt8(p);arr[i*components+j]=val;}}return {array:arr,components,count};}
function mapName(n){const raw=String(n).replace(/_/g," ").replace(/\s+/g," ").trim();if(raw==="화면")return "화면";if(raw==="LED light")return "LED light";if(raw.includes("LED")&&raw.includes("Catrgory")){const m=raw.match(/light\s+(\d)/);return m?`LED Category light ${m[1]}`:raw;}return raw;}
function isActiveMesh(name){const n=mapName(name);return n===activePart;}
async function loadModel(){
  const res=await fetch("./assets/models/tasting-memory.glb");if(!res.ok)throw new Error("GLB 파일을 불러오지 못했습니다.");const buf=await res.arrayBuffer();const dv=new DataView(buf);let off=12,doc=null,bin=null;while(off<buf.byteLength){const len=dv.getUint32(off,true),type=dv.getUint32(off+4,true);off+=8;const chunk=buf.slice(off,off+len);off+=len;if(type===0x4E4F534A)doc=JSON.parse(new TextDecoder().decode(chunk));else if(type===0x004E4942)bin=chunk;}if(!doc||!bin)throw new Error("GLB 데이터가 올바르지 않습니다.");
  const scene=doc.scenes?.[doc.scene||0],nodeIds=scene?.nodes||doc.nodes.map((_,i)=>i);
  const visit=(id)=>{const n=doc.nodes[id];if(n.mesh!==undefined){const meshDef=doc.meshes[n.mesh];for(const prim of meshDef.primitives){if(prim.attributes.POSITION===undefined)continue;const pos=getAccessor(doc,bin,prim.attributes.POSITION),norm=prim.attributes.NORMAL!==undefined?getAccessor(doc,bin,prim.attributes.NORMAL):null,idx=prim.indices!==undefined?getAccessor(doc,bin,prim.indices):null;const p=new Float32Array(pos.count*3),nn=new Float32Array(pos.count*3);for(let i=0;i<pos.count;i++){const x=pos.array[i*3],y=pos.array[i*3+1],z=pos.array[i*3+2];p[i*3]=x-3;p[i*3+1]=z-1.2;p[i*3+2]=-(y-.9);if(norm){nn[i*3]=norm.array[i*3];nn[i*3+1]=norm.array[i*3+2];nn[i*3+2]=-norm.array[i*3+1];}else{nn[i*3]=0;nn[i*3+1]=0;nn[i*3+2]=1;}}
        const mat=doc.materials?.[prim.material||0]||{},pbr=mat.pbrMetallicRoughness||{},color=pbr.baseColorFactor||[.8,.82,.87,1],em=mat.emissiveFactor||[0,0,0];const mb={name:n.name||meshDef.name||"Part",positions:p,normals:nn,indices:idx?.array||null,count:idx?.count||pos.count,color,emissive:em,center:[0,0,0],buffers:{}};for(let i=0;i<p.length;i+=3){mb.center[0]+=p[i];mb.center[1]+=p[i+1];mb.center[2]+=p[i+2];}mb.center=mb.center.map(v=>v/(p.length/3));meshes.push(mb);}}
    (n.children||[]).forEach(visit);};
  nodeIds.forEach(visit);
  for(const m of meshes){m.buffers.pos=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.buffers.pos);gl.bufferData(gl.ARRAY_BUFFER,m.positions,gl.STATIC_DRAW);m.buffers.norm=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.buffers.norm);gl.bufferData(gl.ARRAY_BUFFER,m.normals,gl.STATIC_DRAW);if(m.indices){m.buffers.idx=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.buffers.idx);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,m.indices,gl.STATIC_DRAW);}}
  status.textContent="MODEL READY · "+meshes.length+" MESH PARTS";
}
function render(){if(!gl||!meshes.length)return;resize();gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);const proj=perspective(0.55*(15.8/zoom),canvas.width/canvas.height,.1,100),view=translate(0,0,-zoom),global=mat4Mul(rotY(yaw),rotX(pitch)),loc={pos:gl.getAttribLocation(program,"aPosition"),norm:gl.getAttribLocation(program,"aNormal"),mvp:gl.getUniformLocation(program,"uMVP"),model:gl.getUniformLocation(program,"uModel"),color:gl.getUniformLocation(program,"uColor"),em:gl.getUniformLocation(program,"uEmissive"),hi:gl.getUniformLocation(program,"uHighlight")};
  for(const m of meshes){let extra=mat4Identity();const name=mapName(m.name);if(name==="Dial"&&dialAngle!==0){extra=mat4Mul(translate(...m.center),mat4Mul(rotZ(dialAngle),translate(-m.center[0],-m.center[1],-m.center[2])));}if(name==="Button"&&buttonPressed){extra=mat4Mul(translate(0,0,-.09),extra);}const model=mat4Mul(global,extra),mvp=mat4Mul(mat4Mul(proj,view),model);gl.uniformMatrix4fv(loc.mvp,false,mvp);gl.uniformMatrix4fv(loc.model,false,model);let col=m.color.slice();let em=m.emissive.slice();const active=isActiveMesh(m.name);if(active){em=[Math.max(em[0],.35),Math.max(em[1],.22),Math.max(em[2],.7)];}const led=name.includes("LED");if(led&&active)em=[.85,.62,1];gl.uniform4fv(loc.color,col);gl.uniform3fv(loc.em,em);gl.uniform1f(loc.hi,active?1:0);
    gl.bindBuffer(gl.ARRAY_BUFFER,m.buffers.pos);gl.enableVertexAttribArray(loc.pos);gl.vertexAttribPointer(loc.pos,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,m.buffers.norm);gl.enableVertexAttribArray(loc.norm);gl.vertexAttribPointer(loc.norm,3,gl.FLOAT,false,0,0);if(m.indices){gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.buffers.idx);gl.drawElements(gl.TRIANGLES,m.count,m.indices instanceof Uint32Array?gl.UNSIGNED_INT:m.indices instanceof Uint16Array?gl.UNSIGNED_SHORT:gl.UNSIGNED_BYTE,0);}else gl.drawArrays(gl.TRIANGLES,0,m.count);}
  requestAnimationFrame(render);
}
function selectPart(part){activePart=part;title.textContent=part==="화면"?"Display":part==="LED light"?"LED Light":part==="Button"?"MARK Button":part==="Camera"?"Camera":part==="Dial"?"Dial":part.replace("LED Category light ","Hex LED ");description.textContent=descriptions[part]||"제품의 구성 요소와 작동 방식을 확인합니다.";items.forEach(b=>b.classList.toggle("active",b.dataset.part===part));}
items.forEach(b=>{b.addEventListener("mouseenter",()=>selectPart(b.dataset.part));b.addEventListener("focus",()=>selectPart(b.dataset.part));b.addEventListener("click",()=>selectPart(b.dataset.part));});
dial.addEventListener("input",()=>{dialAngle=Number(dial.value)*Math.PI/180;dialValue.textContent=dial.value+"°";selectPart("Dial");});
press.addEventListener("click",()=>{buttonPressed=!buttonPressed;press.classList.toggle("pressed",buttonPressed);press.textContent=buttonPressed?"RELEASE":"PRESS";feedback.textContent=buttonPressed?"MARK 버튼이 눌렸습니다. 선택 항목을 확정하는 동작을 표현합니다.":"버튼을 눌러 선택한 항목을 확정하는 동작을 체험해 보세요.";selectPart("Button");});
canvas.addEventListener("pointerdown",e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener("pointermove",e=>{if(!dragging)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw+=dx*.008;pitch=Math.max(-1.15,Math.min(1.15,pitch+dy*.008));});
canvas.addEventListener("pointerup",()=>dragging=false);canvas.addEventListener("pointercancel",()=>dragging=false);
canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(11,Math.min(25,zoom+e.deltaY*.012));},{passive:false});
canvas.addEventListener("dblclick",()=>{yaw=.22;pitch=-.05;zoom=15.8;});
try{initGL();loadModel().then(()=>render()).catch(err=>{status.textContent="3D MODEL ERROR · PREVIEW SHOWN";document.querySelector(".model-panel").classList.add("fallback");console.error(err);});}catch(err){status.textContent="3D PREVIEW MODE";document.querySelector(".model-panel").classList.add("fallback");console.error(err);}
selectPart("Dial");
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-visible");revealObserver.unobserve(e.target);}}),{threshold:.12});
document.querySelectorAll(".hero-copy,.hero-art,.intro-grid,.persona-row,.problem-grid,.section-title-row,.process-line,.location-diagram,.app-card,.scenario-grid article,.cmf-image,.cmf-notes,.spec-layout").forEach(el=>{el.classList.add("reveal");revealObserver.observe(el);});
})();