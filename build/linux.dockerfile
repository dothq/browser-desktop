FROM archlinux:latest

COPY firefox /browser

WORKDIR "/browser"

RUN pacman -Sy
RUN pacman -S --noconfirm git mercurial python2 python3 make wget tar zip yasm

RUN git --version && \
    hg --version && \
    python2 --version && \
    python3 --version

RUN ls