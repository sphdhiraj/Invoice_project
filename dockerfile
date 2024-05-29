FROM python:3.11.8

# Set working directory
WORKDIR /app
RUN pip install \
    pymongo \
    google-cloud-documentai \
    watchdog \
    PyMuPDF \
    pandas \
    fastapi \
    pillow \
    bcrypt \
    pydantic \
    PyJWT
EXPOSE 8985

COPY . /app

CMD ["uvicorn", "app:app","--host","0.0.0.0","--port","8985"]
