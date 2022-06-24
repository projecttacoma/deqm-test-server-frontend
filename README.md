This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Local Installation

Clone the source code:

```bash
git clone https://github.com/projecttacoma/deqm-test-server-frontend.git
```

Install dependencies:

```bash
npm install
```

Create a .env.local file and add the following to it:
`NEXT_PUBLIC_DEQM_SERVER=https://abacus-dev.mitre.org/4_0_1`
However, to run a local version of the test server, change this `NEXT_PUBLIC_DEQM_SERVER` to the desired port (this project runs on the default 3000).

## Getting Started

First, run the development server:

```bash
npm run dev
```

OR

To run on a different port than the default 3000:

```bash
npm run dev -- -p portNumber
```

OR

Build, then start. Specify non-default port with `-- -p portNumber`, like above.

```bash
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
