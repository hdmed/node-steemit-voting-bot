# node-steemit-voting-bot
정해진 시간을 주기로 특정 태그의 글 중 초급자에게 랜덤 보팅 파워로 보팅하는 봇입니다. 

### 1. 설치
```sh
$ git clone https://github.com/jongeunpark/node-steemit-voting-bot.git
$ cd node-steemit-voting-bot/
$ npm install
```

### 2. 설정 파일 수정
설치가 완료되면, 2가지 설정 파일을 수정해야 합니다. 
설정 파일은 node-steemit-voting-bot/config 아래에 있는 2파일 입니다.
- user.json: 보팅 및 리플을 작성할 사용자 정보
- config.json: 보팅 파워, 폴링 주기

각 파일 속성 값
** user.json **
```
$ vi configs/user.json
{
	"name": "YOUR_NAME",
	"password": "YOUR_PASSWORD"
}
```
- name: 사용자 계정으로 jongeun 과 같은 값을 입력합니다. 
- password: 사용자 비밀번호로 로그인 시 사용되는 비밀번호 입니다.
** config.json **
```
{
    "monitoringPeriod": 14400,
    "minVotingPower": 50,
    "maxVotingPower": 100,
    "tag":"kr-newbie"
    "introductionLink: "https://steemit.com/kr/@jongeun/1-sbd",
    "lastVotingTimestamp": 1498888335000
}
```
- monitoringPeriod: 특정 태그의 최신 포스트 목록을 조회하는 주기로 단위는 초입니다. 
- minVotingPower: 최소 보팅 파워값으로 단위는 % 입니다. 
- maxVotingPower: 최대 보팅 파워값으로 단위는 % 입니다. 
- tag: 태그 
- introductionLink: 리플에 기입되는 링크
- lastVotingTimestamp: 마지막 보팅 시간입니다. 마지막 보팅 시간을 기준으로 보팅 여부를 판단합니다. 초기에는 -1로 설정하거나 현재 시간으로 입력하세요. 프로그램이 동작하면서 보팅이 완료되면 변경되는 값입니다.

### 3. 실행
```sh
$ node voting-bot.js
```
백그라운로 동작시키리면 아래 명령어를 입력하세요.
```sh
$ nohup node voting-bot.js %
```

### License
MIT
