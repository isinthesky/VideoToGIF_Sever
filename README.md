# 📸**LivePhotoToGIF_RN**

### 영상을 Gif파일로 변환하여 저장하고 사랑들과 공유할 수 있는 모바일 어플리케이션입니다.

### Gif파일의 옵션을 제어하여 생성 할 수 있습니다.

<br>

# Table of Contents

- [Preview](#-preview)
- [Motivation](#-motivation)
- [Challenges](#-challenges)
  - [1. 비디오에서 이미지 추출은 어떻게 해야할까?](##1-비디오에서-이미지-추출은-어떻게-해야할까?)
    - [a. ffmpeg vs OpenCV](###a-ffmpeg-vs-OpenCV)
    - [b. ffmpeg 사용방법](###b-ffmpeg-사용방법)
  - [2. 이미지파일을 어떻게 움직이는 GIF 파일로 만들 수 있을까?](##2-이미지파일을-어떻게-움직이는-GIF-파일로-만들-수-있을까?)
    - [a. GIF에 어떤 image format을 삽입 해야 할까?](###a-GIF에-어떤-image-format을-삽입-해야-할까?)
    - [b. 8bit bitmap의 데이터 구조](###b-8bit-bitmap의-데이터-구조)
    - [c. GIF File 구조, Image frame 삽입](###c-GIF-File-구조,-Image-frame-삽입)
    - [d. LZW 압축이란?](###d-LZW-압축이란?)
    - [e. gif option 적용](###e-gif-option-적용)
  - [3. React navtive cli?](##3-React-navtive-cli?)
    - [a. 심플하지만 다있는 UI](###a-심플하지만-다있는-UI)
    - [b. Navigation으로 모션 화면전환](###b-Navigation으로-모션-화면전환)
    - [c. video file 전송](###c-video-file-전송)
- [Timeline](#-timeline)
- [Video](#-video)
- [Tech stack](#-tech-stack)
- [Repository Link](#-repository-link)
- [Memoir](#-memoir)

<br>

# Preview

| 기본 화면                                                                                                         | 영상 등록 화면                                                                                                    | 변환 완료 화면                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| ![IMG_2298](https://github.com/isinthesky/LivePhotoToGIF_RN/assets/52302090/f7c0bfb3-95b8-4896-a139-9a06361b1aa3) | ![IMG_2299](https://github.com/isinthesky/LivePhotoToGIF_RN/assets/52302090/8701ab42-83c2-4576-b164-19044ac4af5d) | ![IMG_2300](https://github.com/isinthesky/LivePhotoToGIF_RN/assets/52302090/05420e69-ad66-46ea-8058-4f89f9b9e7c2) |

<br>

# Motivation

영상에 관심이 많은 저는 미디어를 다루는 프로젝트 아이디어를 고심했습니다.<br>
미디어를 다루는 라이브러리를 사용하기보다는 컨텐츠의 데이터에 접근해보고 싶었습니다.<br>
비디오에서 bmp, gif로 포맷 변환 하는 과정을 거치며 해당 미디어 포맷에 대한 특징과 구성, 파일 시스템을 깊이 배워보는 좋은 기회로 생각되어 시작하게 되었습니다.<br>
영상에서 GIF 포맷으로 쉽고 빠르게 변환하여 반복 재생되는 GIF의 재미를 공유할 수 있게 구성하였습니다.<br>
또한 개발을 접하고 처음 React native를 통해 모바일 환경에 도전하여 새로운 환경을 이해해 보고 싶었습니다.
<br>
<br>

# Challenges

## 1. 비디오에서 이미지 추출은 어떻게 해야할까?

<p>
### a. ffmpeg vs OpenCV

ffmepg 라이브러리의 사용 경험이 있었지만 OpenCV로도 video에서 이미지 추출이 가능하다는 정보를 얻었습니다.<br>
거의 모든 미디어의 encoding decoding을 지원하고 범용적으로 쓰이는 ffmpeg은 OpenCV도 활용하고 있다는 정보도 얻을 수 있었습니다.<br>
OpenCV를 사용하면 image processing에 대한 장점 있어, 다양한 이미지 효과를 적용하기에 좋다고 생각했고<br>
ffmpeg은 영상에 대한 encoding, decoding, filter 적용에 이점이 있어 OpenCV를 사용하는게 나아 보였지만<br>
쉽고 간단한 동작으로 GIF로 빠르게 변환하는 저의 프로젝트에서는 ffmpeg을 선택하는게 더 가볍고 간편하게 사용할 수 있다고 생각하여 ffmpeg을 직접 사용하게 되었습니다.

| 구분 | ffmpeg          | OpenCV           |
| ---- | --------------- | ---------------- |
| 활용 | 모든 Media 범용 | Image 프로세싱   |
| 실행 | 외부 실행파일   | Software Library |
| 강점 | Media Converter | Data Science     |

<br>

</p>
<p>

### b. 외부파일을 node환경에서 어떻게 사용할 수 있을까?

- [child_process](https://nodejs.org/dist/latest-v20.x/docs/api/child_process.html)

node의 `child_process` 모듈은 popen과 유사하지만 동일하지는 않은 방식으로 하위 프로세스를 스폰하는 기능을 제공합니다.<br>
`child_process`의 popen() 함수는 파이프를 생성하여 프로세스를 열고, 포크, 셸을 호출하여 프로세스를 엽니다.<br>
파이프는 정의상 단방향이므로, 유형 인수는 읽기 또는 쓰기만 지정할 수 있습니다. 그에 따라 결과 스트림은 읽기 전용 또는 쓰기 전용이 됩니다.<br>

`child_process.spawn()` 메서드는 Node.js 이벤트 루프를 차단하지 않고 **자식 프로세스를 비동기적으로 실행**됩니다.<br>
따라서 `execFile({ffmpeg path}, [ffmpeg options]);` 실행 후 결과 `Callback`을 `Promise`로 감싸 코드의 흐름을 제어했습니다.

`child_process.spawn(command[, args][, options])` 메서드의 **args : List of string arguments**를 활용하여 ffmepg의 다양한 option 명령을 활용할 수 있었습니다.

```
const execFile = require("child_process").spawn;

const ffmpeg_callback = execFile({ffmpeg path}, [ffmpeg options]);

return new Promise(
  (resolve) => {
    ffmpeg.stdout.on("data", (x) => {
      process.stdout.write(x.toString());
    });
    ffmpeg.on("close", (code) => {
      resolve({ ok: true, code: code });
      return true;
    });
  },
  (reject) => {
    console.error("extractBmp error:", reject);
    return false;
  },
);
```

<br>
</p>

<p>

## 2. 이미지파일을 어떻게 움직이는 GIF 파일로 만들 수 있을까?

![gif_file_stream](https://github.com/isinthesky/LivePhotoToGIF_RN/assets/52302090/db9544e7-c8c7-4fb5-874f-d1140eaa4976)<br>

간략한 GIF 파일의 구조와 데이터 흐름은, 앞쪽 GIF의 Image Header 부분과 반복되는 Image Frame 부분으로 볼 수 있겠습니다.
<br>

</p>
<p>

### a. GIF에 어떤 image format을 삽입 해야 할까?

<img width="420" alt="스크린샷 2023-05-25 오후 9 56 07" src="https://github.com/isinthesky/LivePhotoToGIF_RN/assets/52302090/cf5ef29b-d337-4c85-bf05-0328b8fb3d6e"><br>
(출처: https://www.fileformat.info/format/gif/egff.htm)

최대 **8Bit Bitmap** 이미지 형식을 지원하는 GIF는 ffmpeg의 추출 pixel_format 옵션에 8Bit Bitmap 추출 옵션인 `bgr8`를 적용하여 Bitmap 파일을 얻을 수 있었습니다..

```
ffmpeg -i {inputPath.mp4} -pix_fmt {bgr8} {outputPath.bmp}
```

<br>
</p>

<p>

### b. 8bit bitmap의 데이터 구조

<img width="288" alt="스크린샷 2023-06-05 오후 10 26 23" src="https://github.com/isinthesky/LivePhotoToGIF_RN/assets/52302090/2d3a1920-d513-4f87-b24a-aefe03723768">

(bitmap image data 배열은 windows의 little endian 형식으로 배열로 파일을 가져왔을 때 bgr 형식으로 읽어오게 됩니다.)

gif에 삽입하기 위한 이미지 데이터 8bit bitmap file에서 `color table`과 `image data`를 얻었습니다.

<br>
</p>

<p>

### c. GIF File 구조, Image frame 삽입

![gif file structure](https://github.com/isinthesky/LivePhotoToGIF_RN/assets/52302090/c34ebb9a-6acb-4010-8b01-630d758f60be)

GIF 파일은 0개 이상의 '이미지'로 채워진 고정된 크기의 그래픽 영역('논리적 화면')을 나타냅니다.<br>
GIF 파일에는 전체 논리적 화면을 채우는 단일 이미지가 있습니다. 다른 파일은 논리 화면을 별도의 하위 이미지로 나눕니다.

GIF 파일은 버전을 나타내는 고정 길이 헤더("GIF87a" 또는 "GIF89a")로 시작하고, 그 뒤에 논리 화면의 픽셀 크기 및 기타 특성을 나타내는 고정 길이 논리 화면 설명자가 이어집니다.<br> 화면 설명자는 또한 글로벌 컬러 테이블(GCT)의 존재 여부와 크기를 지정할 수 있으며, 이 테이블이 있는 경우 다음에 이어집니다.<br>
저는 각 이미지 프레임에 Local Color Table을 사용하게 하였고 글로벌 컬러 테이블(GCT)는 생략하였습니다.

GIF 파일은 Image frame data에 **LZW 압축 알고리즘**이 적용되어 있습니다.

GIF 파일의 Image frame을 구성하기위해 Bitmap File에서 사용하는 데이터는 위 이미지와 같이 Color Table 과 Image Data입니다.
Color Table Data는 그대로 데이터를 삽입하지만 이미지 데이터는 LZW 데이터 압축을 적용해 준 후에 삽입해야합니다.

<br>

</p>
<p>

### d. LZW 압축이란???

LZW 알고리즘은 Lempel-Ziv-Welch의 약자로 **무손실 압축 알고리즘**입니다.
Lempel-Ziv가 만든 LZ78 알고리즘을 개선한 버전입니다.

LZW의 핵심 아이디어는 데이터 공간을 절약하기 위해 **반복되는 Data의 패턴을 만들어서 재사용**합니다.

일반적으로 ASCII 코드는 각 문자를 7비트를 사용하고(0~127) 마지막 1비트를 checksum으로 활용합니다.
LZW에서는 마지막 bit를 활용하여 0x80(128)부터 0xFF(255)까지의 숫자를 한 개의 문자 대신에 둘, 셋 또는 그 이상의 문자열을 표현하는데 사용합니다.

하나의 문자로 구성된 문자열은 유니그램(unigram), 두 개 문자로 구성된 문자열을 바이그램(bigram)이라 하고, 세 개의 문자로 구성된 문자열을 트라이그램(trigram)이라고 합니다. 이보다 더 긴 문자열은 구성하는 문자의 수에 그램(gram)이라는 접미사를 붙여서 부르고, 일반적으로 n-gram이라고 합니다.

그래서 0부터 127까지는 유니그램을 표현하는데 사용하고, 128부터 255까지는 유니그램이 아닌 1보다 큰 n-gram을 나타내는데 사용합니다.

이 추가적인 부분에 들어가는 것은 한 번 이상 나온 문자의 결합 (Combinations of symbols) 값이 들어가게 됩니다.

```
  *     PSEUDOCODE
  1     Initialize table with single character strings
  2     P = first input character
  3     WHILE not end of input stream
  4       C = next input character
  5
  6       IF P + C is in the string table
  7         P = P + C
  8       ELSE
  9         output the code for P
  10
  11      add P + C to the string table
  12        P = C
  13    END WHILE
  14
  15    output code for P
```

위에 수도코드는 LZW 알고리즘에 의해 확장된 공간 안에 중복되는 문자의 합을 넣기 위해 테이블을 만드는 과정입니다..<br>
P를 첫 번째 문자, C를 다음 문자로 선언하고 테이블에서 P + C 값이 있는지 확인합니다. 없으면 string table에 추가합니다..<br>
P + C의 테이블 값이 없을 때까지 계속 진행한다. 이렇듯 문자열의 끝까지 진행하여 테이블을 만들고 압축을 하게됩니다.<br>

<br>

</p>
<p>

### e. GIF option 적용

scale - bitmap의 메모리 저장, 이미지 처리 효율 특성으로 이미지 너비를 4배수로 처리 했습니다.

```
ffmpeg -i {inputPath.mp4} -vf scale={width-px:height-px} {outputPath.bmp}
```

flip/mirror - ffmpeg에서 bitmap file을 추출하는 과정에서 flip/mirror 옵션을 추가하여 옵션을 적용한 이미지를 얻을 수 있게 했습니다.

```
ffmpeg -i {inputPath.mp4} -vf {vflip} {hflip} {outputPath.bmp}
```

delay - 이미지 삽입시 delay 다음 이미지로 전환 되는 지연시간으로 1/100초 단위로 세팅 됩니다.<br>
**delay = (time / fps) \* (time / speed)**<br>
fps 와 speed 값은 커질수록 다음 프레임으로 빨리 전환되는 수치이지만
GIF의 delay option 은 반대로 빨리 전환되기 위해 값이 작아져야 합니다.

```
buf[position++] = 0x21;  // - Graphics Control Extension
buf[position++] = 0xf9;  // Extension / Label.
buf[position++] = 4;     // Byte size.
buf[position++] = (use_transparency === true ? 1 : 0);
buf[position++] = {delay} & 0xff;
buf[position++] = ({delay} >> 8) & 0xff;
buf[position++] = transparent_index;
buf[position++] = 0;     // Block Terminator.
```

<br>
</p>

<p>

## 3. React navtive cli?

일상생활에서 매일 모바일을 사용하지만 그동안 앱 개발에 대한 경험이 없었습니다. 앱을 개발하는 현업에서는 React-Native Expo가 아닌 CLI로 작업을 한다는 얘기를 이따금 들었었고, Expo와 CLI환경의 장단점을 찾아보면서 CLI로 도전해보고 싶다는 생각이 들었습니다. Expo를 사용하면 Expo SDK에서 지원해주는 기능이 많고 간단하게 사용할 수 있기 때문에 빠르고 쉽게 개발할 수 있습니다. 하지만 Native Module과 연결하여 커스터마이징 할 수 없다는 단점과, 빌드할때 유료를 사용하지 않거나, 자체 빌드 서버가 없다면 빌드 큐에서 순서를 기다려야 한다는 단점이 존재합니다. 긴 빌드 시간과 Expo가 자체적으로 제공하는 기능이 많기 때문에 큰 용량 또한 단점이 되어 현업에서는 사용하지 않는다고 합니다. 따라서 Expo가 아닌 CLI로 개발을 진행하면서 직접 환경 설정, 빌드 등 여러 환경에 대한 경험을 해보고 네이티브 기능까지 확장할 수있는 가능성을 염두해 두고 프로젝트를 기획하게 되었습니다.

<br>

</p>
<p>

### a. 심플하지만 다있는 UI

쉽고 간단하게 GIF로 변환 하고 빨리 결과를 볼 수 있는 어플을 의도하고 제작하면서도 필수 기본적인 정보들(video infomation, preview, file size)을 담기위해 노력했습니다.

react native vlc media player를 활용하여 모바일에 저장된 Video file을 재생하였고 무한반복 기능을 설정하여 GIF로 변경되었을 때의 느낌을 미리 느껴볼 수 있도록 했습니다.

기본화면에는 앱의 제목이 표시되도록, **선택한 컨텐츠 정보가 리덕스에 담긴 후에는 VLC플레이어를 통하여 자동 재생, 무한 반복 되도록 하였습니다.**

```
{content.video ? (
    <VLCPlayer
      style={styles.player}
      videoAspectRatio="16:10"
      autoplay={true}
      autoReloadLive={true}
      source={{
        uri: content.video ? content.video.uri : "",
        isNetwork: false,
        isAsset: true,
        autoplay: true,
      }}
    />
  ) : (
    <View style={styles.LogoBox}>
      <Text style={styles.Logo1}>
        Video{"     "}
        {"\n"}
        {"     "} to GIF
      </Text>
    </View>
  )}
```

<br>

</p>

<p>

### b. Navigation으로 모션 화면전환

페이지가 2개(옵션설정 메인창, 결과창) 인 모바일 어플리케이션이지만 버튼 만으로 페이지를 이동하고 싶지 않았습니다.<br>
`NativeStackNavigator`를 활용하여 메인창과 결과창을 이동가능하게 구성하였고, 측면의 넘기는 모션을 활용하여 화면 전환도 가능하게 하였습니다.

```
<NavigationContainer>
  <Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
    <Screen name="Main" component={Main} />
    <Screen name="Viewer" component={Viewer} />
  </Navigator>
</NavigationContainer>
```

<br>

</p>

<p>

### c. file 전송

Video File을 서버로 전송하기위해 FormData형식을 활용하였습니다. <br>
처음엔 GIF의 옵션 정보를 보내기위해 두번 전송하는 구성을 했었는데 여러번의 시도와 수정 후에 FileData와 옵션 정보들을 함께 보낼 수 있었습니다.

```

// Client
const formData = new FormData();
formData.append("file", {
  uri: video.uri,
  type: "multipart/form-data",
  name: video.fileName,
});

formData.append("option", JSON.stringify(option));

const res = await axiosInstance.put("/video/", formData, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

```

nodejs express Server에서는 multer를 활용하여 File Data 전달 받았습니다.
body내 option 객체로 GIF 옵션 정보도 함께 전달 받았습니다.

```

// Server
router.put("/", multer.single("file"),function (req, res, next) {
    const options = JSON.parse(req.body.option);
})

```

잘못된 데이터 전송으로 인한 server의 안전을 위해 multer 생성시점에 파일 사이즈의 **100MB**제한을 두었습니다.

```

multer({ storage, limits: { fileSize: 100000000 } });

```

<br>

</p>

# Timeline

### 프로젝트 기간: 2023.04.03(월) ~ 2023.04.28(금)

- 1 주차: 주제 선정, POC
- 2 주차: POC, 개발
- 3 ~ 4 주차: 개발, 발표

<br>

# Video

https://youtu.be/5NZXGDLRR6s

<br>

# Tech stack

### Frontend

- React native (CLI)
- react-redux
- ESLint

### Backend

- [Node.js](https://nodejs.org/ko/)
- [Express](https://expressjs.com/ko/)
- [ffmpeg](https://ffmpeg.org/)
- ESLint

<br>

# Repository Link

[LivePhotoToGIF_RN](https://github.com/isinthesky/LivePhotoToGIF_RN)

[LivePhotoToGIF_Sever](https://github.com/isinthesky/LivePhotoToGIF_Sever)

<br>

# Memoir

ffmpeg을 통해 얻은 bitmap 파일만으로 gif 파일을 생성하는 작업은 결과물을 너무나 간단해 보이지만 wikipedia의 image foramt 문서를 통해 bitmap file과 gif file의 구조를 이해하고 gif header data를 구성하고 image frame을 삽입하고 옵션을 적용하는 gif file 생성 과정은 쉽지 않았습니다.

어찌보면 메인 도전이였던 gif file 생성은 gif file format 이라는 정답이 있기 때문에 도전하는 과정은 잘못된 접근일 뿐 gif파일을 생성하며 고생했던 헤프닝을 문서에 녹이기 어려워 아쉬웠습니다.

그럼에도 react native cli 환경에서 user 편의성을 고려한 option control들을 배치하고 앱을 만들어 server와 데이터를 주고 받으며 모바일에서 생성된 gif가 실행 됐을 때 매우 만족스러웠습니다.

이제는 낮은 화질과 압출 효율로 인한 파일크기등 gif를 지양하는 움직임도 있지만 data sheet를 보며 생성할 수 있는 가장 재미있는 미디어 형식이지 않을까 생각합니다. 화려하고 역동적인 아이템도 많지만 data sheet와 hexadecimal, data position과 씨름하는 개발도 재미있다는 걸 느꼈습니다.

```

```
