import asyncio
import httpx
import random

API_URL = "http://127.0.0.1:9595/api/v1/signals"

async def send_signal(client, i, sem):
    async with sem:
        payload = {
            "component_id": f"NODE_{random.randint(1, 5)}",
            "severity": random.choice(["P0", "P1", "P2"]),
            "payload": {"metric": random.random(), "iteration": i}
        }
        try:
            resp = await client.post(API_URL, json=payload, timeout=20.0)
            return resp.status_code
        except Exception as e:
            return str(e)

async def main():
    sem = asyncio.Semaphore(50)
    async with httpx.AsyncClient() as client:
        tasks = [send_signal(client, i, sem) for i in range(2000)]
        results = await asyncio.gather(*tasks)
    
    success = [r for r in results if r == 202]
    errors = [r for r in results if isinstance(r, str)]
    print(f"Success: {len(success)}/2000")
    if errors: 
        print(f"Sample Error: {errors[0]}")

if __name__ == "__main__":
    asyncio.run(main())
