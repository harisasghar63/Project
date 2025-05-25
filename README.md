🧑‍💻 Decentralized Freelance Job Marketplace
A decentralized application (dApp) built on Ethereum that connects clients and freelancers through a smart contract. Clients can post jobs with budgets, freelancers can accept them, and both parties can track the progress until completion — all transparently handled on the blockchain.

📦 Features
✍️ Clients can post jobs with a budget in ETH.

👷 Freelancers can accept available jobs.

✅ Clients can mark jobs as completed.

📄 View detailed job status: Open, In Progress, or Completed.

🔐 Secure wallet connection via MetaMask.

🔧 Technologies Used
Solidity – Smart contract language

Remix – For smart contract compilation and deployment

Ethers.js – For connecting the frontend to the Ethereum blockchain

MetaMask – For wallet connection

HTML/CSS/JavaScript – Frontend framework

💼 How to Use
✅ Connect Your Wallet
Install MetaMask.

Click the "Connect Wallet" button in the top right.

Approve access.

✍️ Post a Job (Client)
Enter the title, description, and budget.

Click "Post Job".

Confirm the transaction in MetaMask.

👷 Accept a Job (Freelancer)
Enter the Job ID in the "Accept Job" section.

Click "Accept Job" and confirm in MetaMask.

✅ Complete a Job (Client)
Enter the Job ID in the "Complete Job" section.

Click "Complete Job" and confirm in MetaMask.

📂 File Structure
bash
Copy
Edit
.
├── index.html          # Main frontend HTML
├── style.css           # Styling
├── app.js              # Main JavaScript logic (interacts with contract)
├── README.md           # This file

🛡️ Smart Contract Overview
The smart contract includes:

postJob(string _title, string _desc) - post a new job with a payable budget.

acceptJob(uint _jobId) - accept a job.

completeJob(uint _jobId) - mark a job as completed.

getJob(uint _id) - retrieve job details.

jobCounter() - total number of jobs.

jobs(uint _id) - access raw job struct data.

Events:

JobPosted, JobAccepted, and JobCompleted.

⚠️ Notes
All ETH is stored in the smart contract until the job is marked complete.

Only the client can complete a job.

Only the freelancer (non-client) can accept a job.

Proper error messages are shown for failed transactions.

