import asyncio
import logging
from app.collectors.iss_collector import collect_iss_position

# Configure logging
logging.basicConfig(level=logging.INFO)

async def main():
    print("Running ISS collector manually...")
    await collect_iss_position()
    print("Done.")

if __name__ == "__main__":
    asyncio.run(main())
