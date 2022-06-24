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
However, to run a local version of the test server, change this NEXT_PUBLIC_DEQM_SERVER to the desired port (must not be 3001).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Note that npm start won't work yet.

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.
