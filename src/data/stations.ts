/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RadioStation } from '../types';

export const DEFAULT_STATIONS: RadioStation[] = [
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
    id: 'tbs-seoul',
    name: 'TBS FM Seoul 95.1 (교통방송)',
    frequency: 89.5,
    url: 'http://58.229.191.125:1935/live/fm.stream/playlist.m3u8',
    genre: '실시간 교통 / 종합 뉴스',
    country: '대한민국',
    topic: '뉴스/시사',
    description: '서울 및 수도권 중심의 실시간 종합 교통 정보, 시사 평론, 다양한 교양 토크 및 뉴스 대담 생방송.'
  },
  {
    id: 'kpop-hallyu',
    name: 'Hallyu K-Pop Hit Radio',
    frequency: 91.1,
    url: 'https://stream.zeno.fm/fv6a5f78s2zuv',
    genre: '케이팝 Hits',
    country: '대한민국',
    topic: '음악',
    description: '트렌디한 인기 케이팝 아이돌 신곡부터 가슴을 뛰게 하는 추억의 댄스 곡까지 쉬지 않고 재생하는 대중가요 채널.'
  },
  {
    id: 'febc-seoul',
    name: 'FEBC 극동방송 106.9 (서울)',
    frequency: 92.5,
    url: 'http://febc.fastedge.to/febckorea/seoul_high/playlist.m3u8',
    genre: '문화 교양 / 정보',
    country: '대한민국',
    topic: '교양/학습',
    description: '지친 심신에 활력을 불어넣는 24시간 생활 건강 정보, 긍정에너지 캠페인, 따뜻한 힐링 음악 프로그램.'
  },
  {
    id: 'npr-news',
    name: 'NPR Public Radio USA',
    frequency: 94.1,
    url: 'https://npr-ice.streamguys1.com/live.mp3',
    genre: '보도 시사 / 문화 대담',
    country: '미국',
    topic: '뉴스/시사',
    description: '미국 전역 및 세계 주요 뉴스를 송출하는 국민 대표 라디오. 고품격 오디오 브리핑과 깊이 있는 분석 프로그램.'
  },
  {
    id: 'lofi-cafe',
    name: 'Chillhop Cafe Live US',
    frequency: 95.5,
    url: 'https://stream.zeno.fm/82586617s2zuv',
    genre: '인디 로파이 힙합',
    country: '미국',
    topic: '힐링/로파이',
    description: '글로벌 청취자들이 가장 사랑하는 트렌디한 로파이 인스트루멘탈 힙합 채널. 백그라운드 집중용 음악으로 탁월.'
  },
  {
    id: 'jazz-seattle',
    name: 'Jazz24 Seattle KNKX',
    frequency: 97.5,
    url: 'https://live.jazz24.org/jazz24-mp3',
    genre: '정통 재즈 / 소울 블루스',
    country: '미국',
    topic: '음악',
    description: '미국 시애틀 최고의 라디오 방송국에서 선사하는 정통 클래식 재즈 감상 공간. 빌 에반스, 레이 브라운 등의 리듬.'
  },
  {
    id: 'swiss-pop',
    name: 'Radio Swiss Pop Premium',
    frequency: 99.1,
    url: 'http://stream.srg-ssr.ch/m/rsp/mp3_128',
    genre: '글로벌 팝 Hits',
    country: '스위스 & 유럽',
    topic: '음악',
    description: '스위스 공영방송(SSR)이 운영하는 품격 있는 논스톱 팝송 채널. 광고가 전혀 없이 트렌디하고 감미로운 곡들 엄선.'
  },
  {
    id: 'swiss-jazz',
    name: 'Radio Swiss Jazz Live',
    frequency: 100.5,
    url: 'http://stream.srg-ssr.ch/m/rsj/mp3_128',
    genre: '어쿠스틱 재즈 스탠다드',
    country: '스위스 & 유럽',
    topic: '음악',
    description: '광고나 긴 수다 없이 24시간 연주 음악 위주로 감상할 수 있는 감성 풍부한 고품질 재즈 전문 공영 방송 채널.'
  },
  {
    id: 'swiss-classic',
    name: 'Radio Swiss Classic Radio',
    frequency: 102.1,
    url: 'http://stream.srg-ssr.ch/m/rsc_kr/mp3_128',
    genre: '정통 Classical 스튜디오',
    country: '스위스 & 유럽',
    topic: '교양/학습',
    description: '최상급 오케스트라 명장들의 실황 연주곡과 협주악 등 긴장을 녹이고 뇌를 깨워주는 오리지널 클래식 선율.'
  },
  {
    id: 'classic-fm-london',
    name: 'Classic FM London 93.9',
    frequency: 103.9,
    url: 'https://media-ssl.musicradio.com/ClassicFM',
    genre: '정통 낭만 클래식',
    country: '영국',
    topic: '음악',
    description: '영국 런던에서 발송하는 대규모 정통 클래식 종합 플레이 채널. 전 세계 명 사운드로 귀를 채워줍니다.'
  },
  {
    id: 'bbc-world-service',
    name: 'BBC World Service International',
    frequency: 105.3,
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
    genre: '글로벌 심층 보도 뉴스',
    country: '영국',
    topic: '뉴스/시사',
    description: 'BBC 월드 특파원 전용망을 경유한 신속 정확한 지구촌 헤드라인 보도 뉴스 및 영문 리스닝 시사 교양.'
  },
  {
    id: 'france-info',
    name: 'France Info Radio 106.3',
    frequency: 106.3,
    url: 'https://stream.radiofrance.fr/franceinfo/franceinfo.mp3',
    genre: '프랑스 뉴스 / 예술 정보',
    country: '스위스 & 유럽',
    topic: '뉴스/시사',
    description: '문화 예술의 중심지 파리에서 보내는 실시간 종합 프랑스 뉴스 브리핑, 기획 탐사 보도 및 문화 정세 대담.'
  },
  {
    id: 'venice-classic',
    name: 'Venice Classic Radio Venice',
    frequency: 107.7,
    url: 'http://174.36.206.197:8000/stream',
    genre: '바로크 르네상스 고전',
    country: '스위스 & 유럽',
    topic: '교양/학습',
    description: '이탈리아 베네치아 예술의 전성기였던 중세, 바로크, 르네상스 시대의 섬세한 기악 및 기악곡 송출 채널.'
  }
];
