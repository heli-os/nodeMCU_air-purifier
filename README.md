<!--
*** Thanks for checking out this README Template. If you have a suggestion that would
*** make this better, please fork the repo and create a pull request or simply open
*** an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
-->


<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/960813/NodeMCU_air-purifier">
    <img src="https://github.com/960813/NodeMCU_air-purifier/blob/master/_data/README.png?raw=true" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">[제 1회 YNC 메이커톤] 미세먼지 감지와 공기청정 기능을 가진 무드등 및 CMS</h3>

  <p align="center">
    아두이노(NodeMCU)를 이용한 미세먼지 감지 및 공기 청정 프로젝트 아두이노/웹 소스 코드
    <br />
    <a href="https://github.com/960813/NodeMCU_air-purifier"><strong>Explore the Github »</strong></a>
    <br />
    <br />
    <a href="https://jupiterflow.com/project/2">View Snapshots</a>
    ·
    <a href="https://github.com/960813/NodeMCU_air-purifier/issues">Report Bug</a>
    ·
    <a href="https://github.com/960813/NodeMCU_air-purifier/issues">Request Feature</a>
  </p>
</p>


<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Summary](#summary)
  * [Main Features](#main-features)
  * [Built With](#built-with)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)



<!-- ABOUT THE PROJECT -->
## About The Project
[![미세먼지 감지와 공기청정 기능을 가진 무드등 및 CMS][product-screenshot-1]](https://jupiterflow.com/project/4)
[![미세먼지 감지와 공기청정 기능을 가진 무드등 및 CMS][product-screenshot-2]](https://jupiterflow.com/project/4)
[![미세먼지 감지와 공기청정 기능을 가진 무드등 및 CMS][product-screenshot-3]](https://jupiterflow.com/project/4)
[![미세먼지 감지와 공기청정 기능을 가진 무드등 및 CMS][product-screenshot-4]](https://jupiterflow.com/project/4)
[![미세먼지 감지와 공기청정 기능을 가진 무드등 및 CMS][product-screenshot-5]](https://jupiterflow.com/project/4)

'미세먼지 감지와 공기청정 기능을 가진 무드등 및 CMS'는 2019 제 1회 YNC 메이커톤 출품작으로 제작/개발한 프로젝트입니다. 

### Awards
* 코로나 바이러스로 인한 본선 무기한 연기

### Summary
* aircleaner.ino
    * WiFi 접속
    * 미세먼지 감지(PMS7003)
    * LED 제어
    * FAN 제어
    
* Web Route

    |Desc|Method|Route|What is?|
    |:---|:---|:---|:---|
    |index|GET|/|인덱스|
    |SignIn|POST|/authentication|로그인|
    |SignUp|POST|/authentication/new|회원가입|
    |SignOut|GET|/authentication/signout|로그아웃|
    |view|GET|/view|CMS 접속을 위한 인덱스|
    |getDeviceID|GET|/device/getID|로그인한 회원이 관리하는 DeviceID를 다운로드|
    |DataUpload|POST|/device/data/upload|디바이스에서 미세먼지 측정 값 업로드|
    |DataDownload|POST|/device/data/download|DeviceID를 키로 하여 측정 값 다운로드|
    |SettingUpload|POST|/device/setting/upload|CMS에서 디바이스 설정(새로고침 딜레이,LED모드, 작동 설정)|
    |SettingDownload|POST|/device/setting/download|디바이스의 현재 설정을 다운로드|
    |KakaoDeviceSetting|POST|/kakao/deviceSetting|카카오톡에서 DeviceID 설정|
    |KakaoReadData|POST|/kakao/readData|카카오톡에서 가장 최근 미세먼지 현황 보기|


### Main Features
* Node.js passport, pbkdf2 패키지 + MariaDB를 이용한 회원 관리
* MySQL 패키지를 이용한 Simple CRUD
* 카카오 i OpenBuilder를 이용한 카카오톡 봇 구현
* NodeMCU: WiFi, NeoPixel, PMS, HttpClient 등을 이용한 서버 통신 및 하드웨어 제어

### Built With
* [NodeMCU](https://en.wikipedia.org/wiki/NodeMCU)
* [Express.js](https://expressjs.com)

<!-- CONTRIBUTING -->
## Contributing
This repository is not managed.

<!-- LICENSE -->
## License
Distributed under the MIT License. See `LICENSE` for more information.

<!-- CONTACT -->
## Contact
JIN TAEYANG - keriel@jupiterflow.com

Project Link: [https://github.com/960813/NodeMCU_air-purifier](https://github.com/960813/NodeMCU_air-purifier)


<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* [Passport](http://www.passportjs.org/)
* [pbkdf2](https://www.npmjs.com/package/pbkdf2)


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/960813/nodeMCU_air-purifier?style=flat-square
[contributors-url]: https://github.com/960813/NodeMCU_air-purifier/graphs/contributors

[forks-shield]: https://img.shields.io/github/forks/960813/nodeMCU_air-purifier?style=flat-square
[forks-url]: https://github.com/960813/NodeMCU_air-purifier/network/members

[stars-shield]: https://img.shields.io/github/stars/960813/nodeMCU_air-purifier?style=flat-square
[stars-url]: https://github.com/960813/NodeMCU_air-purifier/stargazers

[issues-shield]: https://img.shields.io/github/issues/960813/nodeMCU_air-purifier?style=flat-square

[issues-url]: https://github.com/960813/NodeMCU_air-purifier/issues

[license-shield]: https://img.shields.io/github/license/960813/nodeMCU_air-purifier?style=flat-square
[license-url]: https://github.com/960813/NodeMCU_air-purifier/blob/master/LICENSE.txt

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=flat-square&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/jupiterflow

[product-screenshot-1]: https://github.com/960813/NodeMCU_air-purifier/blob/master/_data/001.JPG?raw=true
[product-screenshot-2]: https://github.com/960813/NodeMCU_air-purifier/blob/master/_data/002.JPG?raw=true
[product-screenshot-3]: https://github.com/960813/NodeMCU_air-purifier/blob/master/_data/003.JPG?raw=true
[product-screenshot-4]: https://github.com/960813/NodeMCU_air-purifier/blob/master/_data/004.JPG?raw=true
[product-screenshot-5]: https://github.com/960813/NodeMCU_air-purifier/blob/master/_data/005.JPG?raw=true