# `toggle_server.bat` 이해 가이드

## 1) 이 파일은 어떤 언어인가?
- 파일 확장자: `.bat`
- 언어/실행 환경: **Windows 배치 스크립트(Batch Script)**
- 실행 주체: `cmd.exe` (Windows 명령 프롬프트)

즉, 이 파일은 JavaScript나 Python이 아니라, Windows 기본 셸 문법으로 작성된 자동화 스크립트입니다.

---

## 2) 이 파일이 하는 일 (한 줄 요약)
`5173` 포트 상태를 확인해서:
- 이미 서버가 실행 중이면 종료하고
- 실행 중이 아니면 `npm run dev`를 새 창에서 실행하는

"토글(toggle)" 스크립트입니다.

---

## 3) 전체 동작 흐름
1. 배치 파일 위치로 작업 디렉터리를 강제 이동
2. 포트 번호(`5173`)와 내부 상태 변수 초기화
3. `netstat` + `findstr`로 `5173 LISTENING` PID 탐색
4. PID가 있으면 `taskkill`로 종료
5. PID가 없으면 `start ... cmd /c ...`로 `npm run dev` 실행
6. 3초 뒤 창 자동 종료

---

## 4) 현재 코드 구조 (원본 기준)
아래는 현재 파일의 핵심 코드입니다.

```bat
@echo off
setlocal EnableExtensions EnableDelayedExpansion

REM Always run from this batch file directory.
cd /d "%~dp0"

set "PORT=5173"
set "TITLE=Vite_Local_Server"
set "FOUND=0"
set "KILL_FAILED=0"

echo ==========================================
echo [CHECK] Inspecting local server status...
echo ==========================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":%PORT% .*LISTENING"') do (
    set "FOUND=1"
    echo [ACTION] Stopping PID %%a on port %PORT%...
    taskkill /F /PID %%a >nul 2>&1
    if errorlevel 1 set "KILL_FAILED=1"
)

if "%FOUND%"=="1" (
    if "%KILL_FAILED%"=="1" (
        echo [ERROR] Failed to stop one or more processes on port %PORT%.
        echo [HINT] Try running this script as administrator.
    ) else (
        echo [OK] Existing server process stopped.
    )
) else (
    echo [STATUS] Port %PORT% is free.
    echo [ACTION] Starting server with npm run dev...
    start "%TITLE%" /min cmd /c "cd /d ""%~dp0"" && call npm run dev"
    echo [OK] Start command sent.
    echo URL: http://localhost:%PORT%
)

echo ==========================================
echo This window will close in 3 seconds.
timeout /t 3 >nul
```

---

## 5) 줄 단위 설명 (핵심만)
- `@echo off`
  - 실행되는 명령 자체를 화면에 출력하지 않음(로그를 깔끔하게).

- `setlocal EnableExtensions EnableDelayedExpansion`
  - 현재 스크립트 범위에서 환경 변수 변경을 지역화.
  - 명령 확장 기능을 켬.
  - 지연 확장(`!VAR!`) 지원을 켬. (현재 코드는 주로 `%VAR%` 사용)

- `cd /d "%~dp0"`
  - 배치 파일이 있는 폴더로 이동.
  - `/d`는 드라이브가 달라도 이동 가능.
  - `%~dp0`는 "현재 배치 파일의 드라이브+경로".

- `set "PORT=5173"` 등
  - 변수 선언.
  - `set "KEY=VALUE"` 패턴은 공백/특수문자 파싱 문제를 줄이는 안전한 방식.

- `for /f ... in ('명령') do (...)`
  - 명령 실행 결과를 한 줄씩 읽어 반복.
  - 여기서는 `netstat` 출력에서 PID(5번째 토큰)를 추출.

- `netstat -aon | findstr /R /C:":%PORT% .*LISTENING"`
  - 포트 LISTENING 행만 필터링.
  - `-a`: 모든 연결/리스닝 포트
  - `-o`: PID 표시
  - `-n`: 숫자 주소로 표시

- `taskkill /F /PID %%a`
  - 해당 PID 강제 종료 (`/F`).

- `if errorlevel 1 ...`
  - 직전 명령의 종료 코드가 1 이상인지 확인.
  - 여기서는 종료 실패 감지용.

- `if "%FOUND%"=="1" (...) else (...)`
  - PID 발견 여부에 따라 종료 경로/시작 경로 분기.

- `start "TITLE" /min cmd /c "..."`
  - 새 창에서 명령 실행.
  - `/min`: 최소화 실행.
  - `cmd /c`: 명령 실행 후 종료.
  - 내부에서 `call npm run dev`를 사용해 배치 컨텍스트에서 안정적으로 npm 명령 실행.

- `timeout /t 3 >nul`
  - 3초 대기 후 창 종료.
  - `>nul`로 출력 숨김.

---

## 6) 이 파일을 이해할 때 중요한 개념
1. **토글 로직**
- "실행 중이면 끄고, 꺼져 있으면 켠다"는 패턴.

2. **포트 기반 탐지**
- "Vite 프로세스 이름"이 아니라 "5173 포트 점유 여부"로 판단.

3. **PID 추출 후 종료**
- 텍스트 파싱(`for /f`)으로 PID를 뽑아 `taskkill`.

4. **CMD 인용부호(quoting) 규칙**
- 배치 파일에서 가장 자주 깨지는 부분.
- 특히 `start ... cmd /c "..."` 안쪽 따옴표는 `""...""`처럼 이중 인용이 필요할 때가 많음.

5. **종료 코드(errorlevel)**
- 성공/실패를 숫자로 판단하는 방식.
- `0`: 일반적으로 성공, `1 이상`: 실패/미일치 상황.

---

## 7) 이 스크립트에서 사용된 문법 요약표
| 문법 | 예시 | 의미 |
|---|---|---|
| 명령 숨김 | `@echo off` | 실행 명령 자체 출력 비활성화 |
| 지역 스코프 | `setlocal` | 환경 변수 변경 범위 제한 |
| 변수 선언 | `set "A=B"` | 안전한 변수 할당 |
| 변수 참조 | `%PORT%` | 변수 값 사용 |
| 주석 | `REM ...` | 설명/주석 |
| 파이프 | `A ^| B` | 명령 결과를 다음 명령 입력으로 전달 |
| 반복 파싱 | `for /f ... in ('cmd') do (...)` | 명령 출력 텍스트 파싱 |
| 분기 | `if (...) else (...)` | 조건에 따른 실행 흐름 |
| 종료 코드 검사 | `if errorlevel 1 ...` | 직전 명령 성공/실패 판단 |
| 프로세스 종료 | `taskkill /F /PID ...` | PID 기반 종료 |
| 새 창 실행 | `start "T" /min cmd /c "..."` | 별도 최소화 창에서 명령 실행 |
| 출력 버리기 | `>nul 2>&1` | 표준/에러 출력 숨김 |
| 대기 | `timeout /t 3` | N초 대기 |

---

## 7-1) `%`, `%%`, `%~` 그리고 `tokens` 자세히 이해하기

배치 파일을 처음 볼 때 가장 헷갈리는 부분이 바로 이 4가지입니다.

### A. `%변수명%` : 일반 변수 참조
- 의미: 환경 변수 값을 읽습니다.
- 예시:
  - `set "PORT=5173"`
  - `echo %PORT%` -> `5173` 출력

주의할 점:
- 괄호 블록(`if (...)`, `for (...)`) 안에서는 `%VAR%`가 블록 시작 시점에 한 번 확장됩니다.
- 반복 중 값이 바뀌는 변수를 정확히 읽으려면 지연 확장(`!VAR!`)을 사용해야 합니다.

```bat
setlocal EnableDelayedExpansion
set "X=0"
for %%a in (1 2 3) do (
  set /a X+=1
  echo %%X%% 는 초기값처럼 보일 수 있음
  echo !X! 는 매 반복의 최신값
)
```

### B. `%%a` : 배치 파일 안의 for 변수
- 의미: `for` 루프에서 사용하는 임시 변수입니다.
- 규칙:
  - 배치 파일(.bat) 안에서는 `%%a`, `%%b`처럼 `%`를 2개 사용
  - CMD 창에 직접 입력할 때는 `%a`처럼 1개 사용

현재 스크립트 예시:
```bat
for /f "tokens=5" %%a in ('netstat ...') do (
  taskkill /F /PID %%a
)
```
- 여기서 `%%a`는 각 줄에서 추출한 PID 값을 의미합니다.

### C. `%~` : 매개변수(인수) 확장 문법
- `%0`, `%1`, `%2`는 배치 인수입니다.
  - `%0`: 현재 배치 파일 경로
  - `%1`: 첫 번째 인수
- `~`를 붙이면 따옴표 제거, 경로 구성요소 분리 같은 확장이 됩니다.

자주 쓰는 패턴:
- `%~0`: `%0`의 양쪽 따옴표 제거
- `%~dp0`: 현재 배치 파일의 드라이브(`d`) + 경로(`p`)
- `%~nx0`: 파일명(`n`) + 확장자(`x`)

현재 스크립트의 핵심:
```bat
cd /d "%~dp0"
```
- 배치 파일 위치로 이동해서, 어디서 실행하든 상대 경로 문제를 줄입니다.

### D. `tokens` : 줄을 공백 기준으로 잘라 N번째 조각 선택
- `for /f`는 텍스트 한 줄을 기본적으로 공백/탭 기준으로 나눕니다.
- `tokens=5`는 5번째 조각만 변수에 담겠다는 뜻입니다.

예시 줄(개념):
```text
TCP  [::1]:5173  [::]:0  LISTENING  30052
```
- 공백으로 나누면:
  1. `TCP`
  2. `[::1]:5173`
  3. `[::]:0`
  4. `LISTENING`
  5. `30052`

즉, `tokens=5`는 PID(`30052`)를 가져오기 위한 설정입니다.

추가로 자주 쓰는 형태:
- `tokens=1,3` : 1번째와 3번째를 동시에 추출
- `tokens=*` : 한 줄 전체를(앞 공백 정리 후) 하나로 받음
- `delims=:` : 구분자를 공백 대신 `:`로 변경

```bat
for /f "tokens=1,2 delims=:" %%a in ("name:value") do (
  echo key=%%a, val=%%b
)
```

### E. 이 스크립트 한 줄로 다시 읽기
```bat
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":%PORT% .*LISTENING"') do (...)
```
- `%PORT%`: 포트 변수 값 사용
- `%%a`: 각 결과 줄에서 추출된 PID 저장 변수
- `tokens=5`: PID가 있는 5번째 필드 선택
- `^|`: 파이프(`|`)를 `for /f` 명령 문자열 안에서 이스케이프

이 4가지 개념을 이해하면, 배치 파일의 70% 이상은 읽을 수 있습니다.

---

## 8) 자주 발생하는 실수 포인트
- `if (...)` 블록 안 `echo` 문자열에 괄호 `(` `)`를 그대로 넣어 파싱 오류 발생
- `start ... cmd /c` 내부 인용부호가 틀려 실제 명령이 실행되지 않음
- 한글 로그가 코드페이지와 맞지 않아 깨져 보임(기능 오류와 별개)
- `errorlevel` 의미를 반대로 이해하여 성공/실패 분기 뒤집힘

---

## 9) 직접 테스트하는 방법
1. 서버가 꺼진 상태에서 실행
- 기대 결과: 새 Vite 서버가 시작되고 `http://localhost:5173` 접속 가능

2. 한 번 더 실행
- 기대 결과: 동일 포트 점유 PID를 찾아 서버 종료

3. 필요 시 확인 명령
```powershell
netstat -ano | findstr /R /C:":5173 .*LISTENING"
```
- 출력이 있으면 실행 중, 없으면 종료 상태

---

## 10) 정리
- 이 파일은 **Windows Batch**로 작성된 **개발 서버 토글 자동화 스크립트**입니다.
- 핵심은 `netstat`로 PID를 찾고, `taskkill` 또는 `npm run dev`를 분기 실행하는 구조입니다.
- 실무에서는 배치 문법 중 특히 **인용부호 처리**, **if/for 블록 파싱**, **errorlevel 해석**이 중요합니다.
