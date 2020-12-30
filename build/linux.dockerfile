FROM archlinux:latest

RUN pacman -Sy
RUN pacman -S --noconfirm git mercurial python2 python3 make wget nodejs npm tar zip yasm