/* sitemap.js — 과목 담당자(전체 사이트 관리자)만 수정.
   · 상시 네비게이션 / 과목 홈 지도·목록이 이 파일을 읽는다.
   · 장소를 추가하려면 한 줄 추가 + places/<id>/ 폴더 생성. (x,y 는 과목 지도의 핀 위치, 800×520 기준)
   · 각 장소의 제품 목록·내용은 장소 폴더 안(place.js)에서 조별로 관리하므로 여기에는 적지 않는다. */
window.SITE = {
  title: "FIELD OBJECTS 2030",
  footer: "○○대학교 ○○학과 · 스페큘레이티브 디자인 스튜디오 · 2030 시나리오 전시"
};
window.SITEMAP = [
  { id: "myeongdong", name: "명동시장",         en: "MYEONGDONG",               team: "1조", x: 405, y: 238, path: "places/myeongdong/", short: "관광·쇼핑 인파가 시간대별로 폭발적으로 몰리는 보행 전용 상권." },
  { id: "dongmyo",    name: "동묘시장",         en: "DONGMYO",                  team: "2조", x: 520, y: 208, path: "places/dongmyo/",    short: "구제 의류 노점이 좁은 통로를 따라 늘어선 시장." },
  { id: "gangnam",    name: "강남페스티벌",     en: "GANGNAM FESTIVAL",         team: "3조", x: 495, y: 425, path: "places/gangnam/",    short: "도심 대로를 열어 치르는 대규모 야외 축제." },
  { id: "coex",       name: "코엑스박람회장",   en: "COEX EXPO",                team: "4조", x: 640, y: 432, path: "places/coex/",       short: "대형 전시장에서 열리는 박람회. 걷고 서고 기다리는 하루." },
  { id: "myongji",    name: "명지전문대축제장", en: "MYONGJI COLLEGE FESTIVAL", team: "5조", x: 215, y: 255, path: "places/myongji/",    short: "대학 축제의 부스·무대·잔디밭이 한데 얽힌 캠퍼스 야외 공간." }
];
