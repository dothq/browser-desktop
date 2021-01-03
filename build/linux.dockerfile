FROM archlinux:latest
ENV SHELL=/bin/sh
ENV MACH_USE_SYSTEM_PYTHON=true

RUN mkdir /worker
WORKDIR /worker/build
VOLUME /worker/build

RUN useradd -m worker
RUN usermod --append --groups wheel worker
RUN echo 'worker ALL=(ALL) NOPASSWD: ALL' >> \
/etc/sudoers

RUN pacman -Syu --noconfirm
RUN pacman -S --noconfirm base-devel git mercurial python2 python3 make wget tar zip yasm libpulse rustup python-pip
RUN rustup install stable && rustup default stable 
RUN cargo install cbindgen

USER worker

CMD sudo usermod -aG wheel worker && \
    sudo chown -R worker:worker /worker && \
    rustup install stable && rustup default stable  && \
    ./mach bootstrap --application-choice browser --no-interactive && \
    ./mach build
