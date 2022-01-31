import axios, { AxiosError } from 'axios';
import { readFileSync, writeFileSync } from 'fs';
import { promisify } from 'util';

const fqdn = 'https://student.uva.nl/';
const delay = 0;

interface IResults {
  [status: number]: number;
}

async function checkLink(url: string): Promise<number> {
  try {
    const result = await axios.get(url);
    return result.status;
  } catch (error) {
    const axiosError = error as AxiosError;

    if (axiosError.response) return axiosError.response.status;
  }

  return -1;
}

async function sleep(time: number): Promise<void> {
  return promisify(setTimeout)(time);
}

async function main() {
  const results: IResults = {};
  const links = readFileSync('links.csv')
    .toString()
    .split('\n')
    .filter((item) => !!item.trim());
  let result = '';

  for (const link of links) {
    const status = await checkLink(link);

    if (delay > 0) await sleep(delay);

    if (results[status] === undefined) results[status] = 0;

    results[status]++;

    console.log(link.replace(fqdn, '').padEnd(200), status);

    result += link + ',' + status + '\n';
  }

  console.log();
  console.log('Status    Count');
  console.log('-------------------');

  for (const [status, count] of Object.entries(results)) {
    console.log(status.toString().padEnd(8) + ': ' + count);
  }
  console.log();

  console.log('Creating: result.csv');
  writeFileSync('result.csv', result);
}

main();
