FROM archlinux:latest

RUN pacman -Sy
RUN pacman -S --noconfirm git mercurial python2 python3 make wget nodejs-lts-erbium npm tar zip yasm

RUN git --version && \
    hg --version && \
    python2 --version && \
    python3 --version