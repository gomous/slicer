FROM ubuntu:22.04

# Install dependencies and PrusaSlicer
RUN apt-get update && apt-get install -y \
    wget \
    python3 \
    python3-pip \
    prusa-slicer \
    libgtk-3-0 \
    libglu1-mesa \
    libxrender1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxtst6 \
    libnss3 \
    libxrandr2 \
    libasound2 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libxss1 \
    libx11-xcb1 \
    xvfb \
    && rm -rf /var/lib/apt/lists/*

# Set working dir
WORKDIR /app

# Copy files
COPY slicer_api.py .
COPY requirements.txt .
COPY entrypoint.sh .

# Install Python dependencies
RUN pip3 install -r requirements.txt

# Make entrypoint executable
RUN chmod +x entrypoint.sh

# Set display for headless operation
ENV DISPLAY=:99

# Entry point
ENTRYPOINT ["./entrypoint.sh"]
