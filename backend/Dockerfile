FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py ./

# db.json 은 PVC 의 /data/db.json 을 읽는다 (json-server 와 공유).
ENV DB_PATH=/data/db.json

EXPOSE 8001

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
