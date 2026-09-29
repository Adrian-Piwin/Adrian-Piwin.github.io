"""Generate the pixel-art avatar poses used across the site.

Each pose is a horizontal sprite sheet of 24x32 frames, upscaled with
nearest-neighbour so it stays crisp. Run from the repo root:

    python3 tools/avatar.py
"""
from pathlib import Path
from PIL import Image

W, H, SCALE = 24, 32, 8
OUT = Path("assets/img/avatar")

PALETTE = {
    "H": "#a3a3a3",  # hair highlight
    "h": "#7d7d7d",  # hair
    "G": "#6a6a6a",  # fringe
    "D": "#565350",  # fringe shadow
    "e": "#4a2818",  # brow / sideburn
    "S": "#ffd5ad",  # skin
    "s": "#efbf93",  # skin shadow
    "E": "#4f8cf0",  # eyes
    "P": "#ffb7cf",  # cheeks
    "B": "#79442b",  # beard
    "M": "#b18c68",  # mouth
    "L": "#e5b88d",  # neck
    "J": "#cb4141",  # jacket
    "j": "#ac3232",  # jacket shade
    "k": "#972626",  # jacket lapel
    "r": "#791c1c",  # jacket hem
    "W": "#ffffff",  # shirt
    "w": "#e4e8f0",  # shirt shade
    "p": "#76428a",  # logo
    "q": "#cbdbfc",  # logo light
    "K": "#1b1b1f",  # jeans
    "N": "#000000",  # jeans shade
    "R": "#ac3232",  # shoes
    "u": "#fbd6d6",  # soles
    # props
    "O": "#fb9101",  # accent orange
    "o": "#ffc166",  # accent light
    "T": "#2b303b",  # device body
    "t": "#454c5a",  # device light
    "b": "#4f8cf0",  # button blue
    "g": "#8d96a8",  # metal
    "c": "#fdf3e3",  # paper
    "C": "#e9d9bf",  # paper shade
    "x": "#e8788a",  # heart
}

# The original character, 16 columns wide, placed at x+4, y+1.
BASE = [
    ".....hhhhHH.....",
    "....hhhhhhHH....",
    "....GDGDGDGD....",
    "....GDGDGDGD....",
    "....eSSSSSSe....",
    "....SSESSESS....",
    "....SPPSSPPS....",
    "....BSSSSSSB....",
    ".....BBMMBB.....",
    "......BBBB......",
    "....JJLLLLJJ....",
    "...JjjWLLWjjJ...",
    "..JjjkWWWWkjjJ..",
    "..JjjkWWWWkjjJ..",
    "..JjjkWpqWkjjJ..",
    "..JjjkWqpWkjjJ..",
    "..JjjkWwWWkjjJ..",
    "..JjjkWwWWkjjJ..",
    "..SjkkWwWWkkjS..",
    "..SrkkWwWWkkrS..",
    "....rrKKKKrr....",
    ".....KKKKKK.....",
    ".....KK..KK.....",
    ".....KK..KK.....",
    ".....KK..KK.....",
    ".....KK..KK.....",
    ".....KK..KK.....",
    ".....KK..KK.....",
    ".....KN..NK.....",
    ".....KN..NK.....",
    "....uRR..RRu....",
]


class Frame:
    def __init__(self):
        self.px = [["."] * W for _ in range(H)]
        for r, row in enumerate(BASE):
            for c, ch in enumerate(row):
                self.px[r + 1][c + 4] = ch

    def set(self, x, y, ch):
        if 0 <= x < W and 0 <= y < H:
            self.px[y][x] = ch

    def rect(self, x0, y0, x1, y1, ch):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.set(x, y, ch)

    def draw(self, x, y, rows):
        """Stamp a small pattern; '.' is skipped, ' ' clears."""
        for dy, row in enumerate(rows):
            for dx, ch in enumerate(row):
                if ch == ".":
                    continue
                self.set(x + dx, y + dy, "." if ch == " " else ch)

    # Arms on the base: viewer-left sleeve x6-7, viewer-right sleeve x16-17, y13-20.
    def drop_left_arm(self):
        self.rect(6, 13, 6, 20, ".")
        self.rect(7, 13, 7, 20, "J")
        self.set(7, 20, "r")

    def drop_right_arm(self):
        self.rect(17, 13, 17, 20, ".")
        self.rect(16, 13, 16, 20, "J")
        self.set(16, 20, "r")

    def blink(self):
        self.set(10, 6, "e")
        self.set(13, 6, "e")

    def smile(self):
        self.set(11, 9, "W")
        self.set(12, 9, "W")

    def image(self):
        im = Image.new("RGBA", (W, H))
        for y in range(H):
            for x in range(W):
                ch = self.px[y][x]
                if ch != ".":
                    im.putpixel((x, y), tuple(int(PALETTE[ch][i:i + 2], 16) for i in (1, 3, 5)) + (255,))
        return im


def wave(up):
    f = Frame()
    f.smile()
    f.drop_right_arm()
    # upper arm out to the side, forearm up
    f.draw(17, 12, ["JJJ", "jjj"])
    if up:
        f.draw(19, 7, ["SS", "SS", "Jj", "Jj", "Jj"])
        f.set(18, 7, "S")
    else:
        f.draw(20, 7, ["SS", "SS", "Jj", "Jj"])
        f.draw(19, 11, ["Jj"])
        f.set(22, 7, "S")
    return f


def phone(glow):
    f = Frame()
    f.drop_right_arm()
    # forearm bent in front of the chest, phone in hand
    f.draw(15, 14, ["jJ", "jJ", "Jj"])
    f.draw(13, 15, ["SS"])
    f.draw(12, 11, ["TTT", "TOT" if glow else "ToT", "TOT" if glow else "ToT", "TTT"])
    # eyes glance down at the screen
    f.set(10, 6, "S")
    f.set(13, 6, "S")
    f.set(10, 7, "E")
    f.set(13, 7, "E")
    f.set(10, 7, "E")
    f.set(11, 7, "S")
    return f


def controller(press):
    f = Frame()
    f.smile()
    # forearms angle in towards the waist instead of hanging
    f.rect(6, 18, 7, 20, ".")
    f.rect(16, 18, 17, 20, ".")
    f.rect(7, 18, 7, 20, "J")
    f.rect(16, 18, 16, 20, "J")
    f.set(7, 20, "r")
    f.set(16, 20, "r")
    f.set(6, 18, "j")
    f.set(17, 18, "j")
    # controller held at the waist
    f.draw(8, 18, ["STTTTTTS"])
    f.draw(8, 19, ["T" + ("t" if press else "T") + "TTTT" + ("O" if press else "o") + "T"])
    f.draw(8, 20, [".TT..TT."])
    f.set(14, 18, "b")
    return f


def curl(up):
    f = Frame()
    f.drop_right_arm()
    if up:
        # elbow tucked at the side, forearm up, dumbbell at the shoulder
        f.draw(17, 13, ["J..", "jJJ", "jjJ", "jjj"])
        f.draw(18, 12, ["SS"])
        f.draw(16, 10, [
            "TT...TT",
            "TtgggtT",
            "TtgggtT",
            "TT...TT",
        ])
        f.draw(18, 11, ["SS"])
        # effort face
        f.set(10, 6, "e")
        f.set(13, 6, "e")
        f.set(11, 9, "W")
        f.set(12, 9, "W")
    else:
        f.draw(17, 13, ["J", "j", "j", "j", "j", "j", "S", "S"])
        f.draw(15, 19, [
            "TT...TT",
            "Ttg.gtT",
            "Ttg.gtT",
            "TT...TT",
        ])
    return f


def envelope(lift):
    f = Frame()
    f.smile()
    f.drop_right_arm()
    y = 13 - lift
    f.draw(17, 13, ["JJJJ", "jjjj"])
    f.draw(21, 13, ["S", "S"])
    f.draw(19, y - 3, [
        "CCCCC",
        "CcxcC",
        "cxxxc",
        "ccxcc",
    ])
    return f


POSES = {
    "wave": [wave(True), wave(False), (lambda f: (f.blink(), f)[1])(wave(True))],
    "phone": [phone(True), phone(False)],
    "controller": [controller(False), controller(True)],
    "curl": [curl(False), curl(True)],
    "envelope": [envelope(0), envelope(1)],
}


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, frames in POSES.items():
        sheet = Image.new("RGBA", (W * len(frames), H))
        for i, frame in enumerate(frames):
            sheet.alpha_composite(frame.image(), (i * W, 0))
        sheet = sheet.resize((sheet.width * SCALE, sheet.height * SCALE), Image.NEAREST)
        sheet.save(OUT / f"{name}.png", optimize=True)
        print(f"{name}: {len(frames)} frames")


if __name__ == "__main__":
    main()
