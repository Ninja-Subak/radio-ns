/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RadioStation } from '../types';

export const DEFAULT_STATIONS: RadioStation[] = [
  {
    id: 'gbn-kpop',
    name: 'GBN K-Pop Retro Sound',
    frequency: 87.7,
    url: 'https://stream.zeno.fm/0t5gky1qxe8uv',
    genre: '케이팝 레트로',
    country: '대한민국',
    topic: '음악',
    description: '90년대부터 2010년대까지 가슴 뭉클한 클래식 K-Pop 발라드와 댄스 가요들을 엄선하여 재생합니다.'
  },
  {
    id: 'lofi-sora',
    name: 'Sora Lofi Ambient',
    frequency: 88.1,
    url: 'https://stream.zeno.fm/0ka26ndvbe8uv',
    genre: '로파이 / 앰비언트',
    country: '대한민국',
    topic: '힐링/로파이',
    description: '작업하거나 휴식할 때 좋은 몽환적인 감성 로파이 비트와 조용한 아날로그 질감의 사운드.'
  },
  {
    id: 'ebs-bandi',
    name: 'EBS FM 책 읽어주는 라디오',
    frequency: 88.9,
    url: 'http://ebsonair.ebs.co.kr/fmradiobandi/bandihq/playlist.m3u8',
    genre: '교양 / 오디오북',
    country: '대한민국',
    topic: '교양/학습',
    description: '교육 방송 EBS 대표 온에어. 에세이, 세계 문학 낭독 및 수준 높은 인문학 강좌가 흘러갑니다.'
  },
  {
    id: 'tbs-seoul',
    name: 'TBS FM Seoul 95.1 (교통방송)',
    frequency: 89.5,
    url: 'http://58.229.191.125:1935/live/fm.stream/playlist.m3u8',
    genre: '교통 / 뉴스',
    country: '대한민국',
    topic: '뉴스/시사',
    description: '서울 실시간 교통 정보, 심도 깊은 시사 토크와 기사 평론 및 유익한 교양 정보를 제공하는 공익 채널.'
  },
  {
    id: 'fip-paris',
    name: 'FIP Radio Paris Live',
    frequency: 90.3,
    url: 'https://stream.radiofrance.fr/fip/fip.mp3',
    genre: '재즈 / 일렉트로 / 인디',
    country: '프랑스',
    topic: '음악',
    description: '광고 없이 예술적인 선율로 전 세계 인디 락, 월드 뮤직, 어쿠스틱을 솜씨 있게 블렌딩하는 전설적인 프랑스 공영 채널.'
  },
  {
    id: 'kpop-hallyu',
    name: 'Hallyu K-Pop Hit Radio',
    frequency: 91.1,
    url: 'https://stream.zeno.fm/fv6a5f78s2zuv',
    genre: '케이팝 Hits',
    country: '대한민국',
    topic: '음악',
    description: '글로벌 차트를 주름잡는 화려한 최신 케이팝 보이/걸그룹 타이틀 곡 및 뜨거운 댄스 넘버 논스톱 플레이.'
  },
  {
    id: 'cafe-piano',
    name: 'Cafe Piano Melody Room',
    frequency: 91.9,
    url: 'https://stream.zeno.fm/ym95p9e6p0hvv',
    genre: '피아노 연주',
    country: '일본',
    topic: '힐링/로파이',
    description: '비 온 뒤 촉촉한 아침의 노천카페 정경을 담아낸 듯 마음을 수놓는 아늑하고 은은한 클래식/재즈 피아노 연주곡.'
  },
  {
    id: 'febc-seoul',
    name: 'FEBC 극동방송 106.9 (서울)',
    frequency: 92.5,
    url: 'http://febc.fastedge.to/febckorea/seoul_high/playlist.m3u8',
    genre: '문화 교양 / 정보',
    country: '대한민국',
    topic: '교양/학습',
    description: '희망을 노래하는 잔잔한 경음악과 따뜻한 힐링 토크, 활력을 가득 심어주는 다채로운 생활 교양 에세이.'
  },
  {
    id: 'citypop-japan',
    name: 'Tokyo City Pop 24/7',
    frequency: 93.3,
    url: 'https://stream.zeno.fm/2v2xbyu1098uv',
    genre: '시티팝 / 그루브',
    country: '일본',
    topic: '음악',
    description: '여름밤 청량한 바람과 화려한 도심 불빛 아래 달리는 차창 밖 풍경에 완벽히 어울리는 복고풍 오리지널 시티팝 리듬.'
  },
  {
    id: 'npr-news',
    name: 'NPR Public Radio USA',
    frequency: 94.1,
    url: 'https://npr-ice.streamguys1.com/live.mp3',
    genre: '보도 시사 / 문화 대담',
    country: '미국',
    topic: '뉴스/시사',
    description: '공정하고 심지 굳은 미국 국영 헤드라인 보도. 수준급 오디오 인터뷰와 폭넓은 세계 정세 분석 제공.'
  },
  {
    id: 'anime-premium',
    name: 'Studio Ghibli & Anime OST',
    frequency: 94.7,
    url: 'https://stream.zeno.fm/n30b7hpsbe8uv',
    genre: '애니메이션 OST',
    country: '일본',
    topic: '음악',
    description: '감성이 고스란히 젖어드는 아련한 추억의 하이라이트 애니메이션 피아노 선율과 청아한 코러스 테마 플레이리스트.'
  },
  {
    id: 'lofi-cafe',
    name: 'Chillhop Cafe Live US',
    frequency: 95.5,
    url: 'https://stream.zeno.fm/82586617s2zuv',
    genre: '인디 로파이 힙합',
    country: '미국',
    topic: '힐링/로파이',
    description: '해외 매니아들의 극찬을 받는 따끈한 정통 Lo-Fi 힙합 인스트루멘탈. 세련된 비트로 백그라운드 집중용으로 강력 추천.'
  },
  {
    id: 'classic-rock',
    name: 'Classic Rock & Metal Anthem',
    frequency: 96.3,
    url: 'https://stream.zeno.fm/6swzsy77p0hvv',
    genre: '클래식 락앤롤',
    country: '미국',
    topic: '음악',
    description: '락 역사 속 명장들의 불멸하는 드럼 비트와 화려한 기타 기프. 전율 넘치는 정통 하드락 클래식.'
  },
  {
    id: 'smooth-jazz',
    name: 'Smooth Jazz Late Night',
    frequency: 96.9,
    url: 'https://stream.zeno.fm/7k9epu81t8uvw',
    genre: '스무스 재즈 / 알앤비',
    country: '미국',
    topic: '음악',
    description: '무게감 있는 더블 베이스와 서정적이고 현대적인 색소폰 선율이 빚어내는 도시의 나른한 밤 분위기 야상곡.'
  },
  {
    id: 'jazz-seattle',
    name: 'Jazz24 Seattle KNKX',
    frequency: 97.5,
    url: 'https://live.jazz24.org/jazz24-mp3',
    genre: '정통 재즈 / 블루스',
    country: '미국',
    topic: '음악',
    description: '미국 시애틀 최고의 헤리티지 재즈 채널. 마일스 데이비스 등 거장들이 선사하는 황홀한 블루지 리빙룸 라운지.'
  },
  {
    id: 'bbc-radio1',
    name: 'BBC Radio 1 UK London',
    frequency: 98.3,
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
    genre: '인디 / 일렉트로 / 팝',
    country: '영국',
    topic: '음악',
    description: '트렌드의 첨단을 달리는 BBC의 젊은 대표 채널. 신인 아티스트 인디 브릿팝과 환상적인 댄스 클러빙 믹스 방송.'
  },
  {
    id: 'swiss-pop',
    name: 'Radio Swiss Pop Premium',
    frequency: 99.1,
    url: 'http://stream.srg-ssr.ch/m/rsp/mp3_128',
    genre: '글로벌 팝 Hits',
    country: '스위스',
    topic: '음악',
    description: '유럽 명가 스위스 공영방송(SSR) 제작. 불필요한 사담 없이 아침잠을 은은하게 깨워주는 세련된 정통 발라드, 팝송송출.'
  },
  {
    id: 'swiss-jazz',
    name: 'Radio Swiss Jazz Live',
    frequency: 100.5,
    url: 'http://stream.srg-ssr.ch/m/rsj/mp3_128',
    genre: '재즈 스탠다드 연주',
    country: '스위스',
    topic: '음악',
    description: '광고 비중 제로의 완벽히 깔끔한 24시간 피아노-트럼펫-섹션 정통 어쿠스틱 연주 실황 전문 클래식 라운지.'
  },
  {
    id: 'france-musique',
    name: 'France Musique Classique',
    frequency: 101.3,
    url: 'https://stream.radiofrance.fr/francemusique/francemusique.mp3',
    genre: '교향 정통 클래식',
    country: '프랑스',
    topic: '교양/학습',
    description: '프랑스 국립 라디오 중계센터 오리지널 실황. 엄숙하고 유려하게 흐르는 바로크 및 현악 사중주 향연.'
  },
  {
    id: 'swiss-classic',
    name: 'Radio Swiss Classic Radio',
    frequency: 102.1,
    url: 'http://stream.srg-ssr.ch/m/rsc_kr/mp3_128',
    genre: '교향곡 / 협주곡 클래식',
    country: '스위스',
    topic: '교양/학습',
    description: '명실상부 스위스 심포니 단원 고품질 라이브 하이라이트. 온전한 명상과 인지력 향상에 어울리는 최적의 힐링 곡들.'
  },
  {
    id: 'wqxr-classical',
    name: 'WQXR 105.9 FM New York Classical',
    frequency: 102.9,
    url: 'https://stream.wqxr.org/wqxr.mp3',
    genre: '클래식 명작선',
    country: '미국',
    topic: '음악',
    description: '미국 뉴욕에서 직접 발송하는 초강력 지미 앤 모차르트 클래식 네트워크. 최고의 예술적 풍미를 보장합니다.'
  },
  {
    id: 'classic-fm-london',
    name: 'Classic FM London 93.9',
    frequency: 103.9,
    url: 'https://media-ssl.musicradio.com/ClassicFM',
    genre: '낭만주의 클래식',
    country: '영국',
    topic: '음악',
    description: '영국 황실 오케스트라 특설 라이브 테이프 리플레이를 바탕으로, 편안함 속 몰입을 이끌어 주는 환상적인 선율.'
  },
  {
    id: 'lofi-chillhop-instrumental',
    name: 'Chillhop Instrumental Study',
    frequency: 104.7,
    url: 'https://stream.zeno.fm/f38un093ne8uv',
    genre: '로파이 / 초집중 비트',
    country: '독일',
    topic: '힐링/로파이',
    description: '지나친 자극을 정화하여 부드러운 화이트 노이즈처럼 흐르는 인스트루멘탈 힙합 루프. 독서와 작업용 배경 음악.'
  },
  {
    id: 'bbc-world-service',
    name: 'BBC World Service International',
    frequency: 105.3,
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
    genre: '글로벌 심층 보도 뉴스',
    country: '영국',
    topic: '뉴스/시사',
    description: '전 세계의 시선이 집중되는 팩트 기반 헤드라인 뉴스룸 라이브. 실감 나고 지적인 뉴스 브리핑 인터뷰.'
  },
  {
    id: 'france-info',
    name: 'France Info Radio 106.3',
    frequency: 106.3,
    url: 'https://stream.radiofrance.fr/franceinfo/franceinfo.mp3',
    genre: '세계 동향 / 종합 기획 뉴스',
    country: '프랑스',
    topic: '뉴스/시사',
    description: '실시간으로 갱신되는 유력 월드 뉴스 브리핑, 프랑스 현지 문화 정세 탐사 리포트 전문 24시간 뉴스 채널.'
  },
  {
    id: 'synthwave-retro',
    name: 'Neon Retro Synthwave Ride',
    frequency: 106.9,
    url: 'https://stream.zeno.fm/8qguxay2be8uv',
    genre: '신스웨이브 / 신스팝',
    country: '미국',
    topic: '음악',
    description: '도심 속 네온 사인이 속도감 있게 스치는 화려한 사이버펑크 감성의 80s 아날로그 아웃런 전자음악.'
  },
  {
    id: 'venice-classic',
    name: 'Venice Classic Radio Venice',
    frequency: 107.7,
    url: 'http://174.36.206.197:8000/stream',
    genre: '르네상스 / 바로크 기악',
    country: '이탈리아',
    topic: '교양/학습',
    description: '예술 부흥의 찬란한 산실 베네치아 학파 정통 오케스트라 하프시코드 및 현악 중주 등의 고풍스러운 명곡 엄선.'
  }
];
