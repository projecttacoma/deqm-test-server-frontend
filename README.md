DEQM Test Server Frontend is a frontend for the DEQM Test Server. 
Functionality includes:
- View resources
- Create new resources
- Update existing resources

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

To run the server on localhost, make sure you've pulled the latest version of the [DEQM Test Server](https://github.com/projecttacoma/deqm-test-server), then create a .env.local file and add the following: 
`NEXT_PUBLIC_DEQM_SERVER=http://localhost:3000/4_0_1`


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

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

# License

Copyright 2022 The MITRE Corporation

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

```
http://www.apache.org/licenses/LICENSE-2.0
```

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
