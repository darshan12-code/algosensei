const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const withRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const is429 = err.response?.status === 429;
      if (is429 && i < retries - 1) {
        const delay = Math.pow(2, i) * 1000;
        console.log(`429 hit, retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        throw err;
      }
    }
  }
};

export default withRetry;