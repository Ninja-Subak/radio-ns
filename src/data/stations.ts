/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RadioStation } from '../types';

export const DEFAULT_STATIONS: RadioStation[] = [
  {
    id: 'lofi',
    name: 'Sora Lofi Ambient',
    frequency: 89.1,
    url: 'https://stream.zeno.fm/0ka26ndvbe8uv',
    genre: 'Lofi / Chill',
    description: '공부할 때, 작업할 때, 사색할 때 듣기 좋은 따뜻한 복고풍 로파이 비트와 아날로그 질감의 감성 멜로디.'
  },
  {
    id: 'synthwave',
    name: 'Nightwave Vapor/Synth',
    frequency: 91.5,
    url: 'https://radio.plaza.one/mp3',
    genre: 'Synthwave / Retro',
    description: '80년대 레트로 미래주의 감성과 고풍스러운 네온 사인을 떠올리게 하는 몽환적인 신스웨이브 오디세이.'
  },
  {
    id: 'classical',
    name: 'Classic FM London',
    frequency: 93.9,
    url: 'https://media-ssl.musicradio.com/ClassicFM',
    genre: 'Classical',
    description: '바흐, 모차르트, 쇼팽 등 마음의 평온과 지적 충전을 선사하는 정통 하이엔드 클래식 선율.'
  },
  {
    id: 'jazz',
    name: 'Jazz24 Seattle',
    frequency: 97.5,
    url: 'https://live.jazz24.org/jazz24-mp3',
    genre: 'Jazz / Blues',
    description: '미국 시애틀 최고의 방송국이 전하는 소울 가득한 마일스 데이비스, 콜트레인 등의 블루지 정통 재즈 터치.'
  },
  {
    id: 'kpop',
    name: 'Hallyu K-Pop Hit',
    frequency: 101.9,
    url: 'https://stream.zeno.fm/fv6a5f78s2zuv',
    genre: 'K-Pop',
    description: '트렌디한 아이돌 신곡부터 추억의 명곡까지 24시간 쉬지 않고 활력을 채우는 대한민국 No.1 대중가요 채널.'
  },
  {
    id: 'news',
    name: 'BBC World Service',
    frequency: 105.3,
    url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
    genre: 'News / World',
    description: '실시간 글로벌 뉴스, 유익한 다큐멘터리, 고품격 글로벌 이슈 분석을 전해주는 공신력 있는 월드 브로드캐스트.'
  }
];
