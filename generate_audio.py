"""Generate the prerecorded Mandarin child-voice clips used by the lesson UI.

Run with edge-tts available on PYTHONPATH. The generated MP3 files are committed
to the static site; visitors do not call a speech service at playback time.
"""

import asyncio
from pathlib import Path

import edge_tts


ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "audio"
VOICE = "zh-CN-YunxiaNeural"

CARD_LINES = {
    "initials": [
        ("b", "玻，玻璃的玻"), ("p", "坡，山坡的坡"), ("m", "摸，摸一摸的摸"),
        ("f", "佛，大佛的佛"), ("d", "得，得到的得"), ("t", "特，特别的特"),
        ("n", "你，你好的你"), ("l", "乐，快乐的乐"), ("g", "哥，哥哥的哥"),
        ("k", "科，科学的科"), ("h", "喝，喝水的喝"), ("j", "鸡，小鸡的鸡"),
        ("q", "七，七个的七"), ("x", "西，西瓜的西"), ("zh", "知，知道的知"),
        ("ch", "吃，吃饭的吃"), ("sh", "师，老师的师"), ("r", "日，太阳的日"),
        ("z", "字，写字的字"), ("c", "草，小草的草"), ("s", "三，三个的三"),
        ("y", "衣，衣服的衣"), ("w", "乌，乌鸦的乌"),
    ],
    "simpleFinals": [
        ("a", "阿，阿姨的阿"), ("o", "喔，公鸡喔喔叫"),
        ("e", "鹅，白鹅的鹅"), ("i", "衣，衣服的衣"),
        ("u", "乌，乌鸦的乌"), ("ü", "鱼，小鱼的鱼"),
    ],
    "compoundFinals": [
        ("ai", "爱，爱心的爱"), ("ei", "飞，飞机的飞"),
        ("ui", "水，喝水的水"), ("ao", "猫，小猫的猫"),
        ("ou", "狗，小狗的狗"), ("iu", "六，六个的六"),
        ("ie", "蝶，蝴蝶的蝶"), ("üe", "月，月亮的月"),
    ],
    "nasalFinals": [
        ("an", "安，安全的安"), ("en", "门，大门的门"),
        ("in", "音，音乐的音"), ("un", "云，白云的云"),
        ("ang", "羊，小羊的羊"), ("eng", "风，大风的风"),
        ("ing", "星，星星的星"), ("ong", "钟，时钟的钟"),
    ],
}

TONE_EXAMPLES = {
    "a": ["阿", "啊", "啊", "啊"],
    "o": ["喔", "哦", "哦", "哦"],
    "e": ["婀", "鹅", "恶心的恶", "饿"],
    "i": ["衣", "疑", "已", "意"],
    "u": ["乌", "无", "五", "物"],
    "ü": ["迂", "鱼", "雨", "玉"],
}

WRITE_LINES = {
    "a": "阿，阿姨的阿", "o": "喔，公鸡喔喔叫", "e": "鹅，白鹅的鹅",
    "i": "衣，衣服的衣", "u": "乌，乌鸦的乌", "ü": "鱼，小鱼的鱼",
    "b": "玻，玻璃的玻", "p": "坡，山坡的坡", "m": "摸，摸一摸的摸",
    "f": "佛，大佛的佛", "n": "你，你好的你", "l": "乐，快乐的乐",
}

QUIZ_LINES = ["猫", "狗", "兔子", "苹果", "汽车", "飞机", "花", "书", "月亮", "西瓜", "小鸟", "雨伞"]


def safe_key(letter):
    return letter.replace("ü", "v")


def clips():
    for group, lines in CARD_LINES.items():
        for letter, text in lines:
            yield f"card-{group}-{safe_key(letter)}", text
    for vowel, examples in TONE_EXAMPLES.items():
        for index, example in enumerate(examples):
            tone_name = ["一声", "二声", "三声", "四声"][index]
            yield f"tone-{safe_key(vowel)}-{index}", f"{tone_name}。{example}。"
    for letter, text in WRITE_LINES.items():
        yield f"write-{safe_key(letter)}", text
    for index, word in enumerate(QUIZ_LINES):
        yield f"quiz-{index}", word
        yield f"correct-{index}", f"答对啦！{word}。"
    yield "sound-on", "声音打开啦。"


async def generate(key, text, semaphore):
    async with semaphore:
        output = OUTPUT / f"{key}.mp3"
        if output.is_file() and output.stat().st_size >= 5000:
            return
        for attempt in range(3):
            try:
                await edge_tts.Communicate(text, VOICE, rate="-12%", pitch="+10Hz").save(str(output))
                if output.stat().st_size == 0:
                    raise RuntimeError("empty audio")
                print(key, output.stat().st_size, flush=True)
                return
            except Exception:
                output.unlink(missing_ok=True)
                if attempt == 2:
                    raise
                await asyncio.sleep(1 + attempt)


async def main():
    OUTPUT.mkdir(exist_ok=True)
    semaphore = asyncio.Semaphore(4)
    await asyncio.gather(*(generate(key, text, semaphore) for key, text in clips()))


if __name__ == "__main__":
    asyncio.run(main())

