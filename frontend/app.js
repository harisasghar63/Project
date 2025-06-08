// Contract address on the blockchain
const CONTRACT_ADDRESS = "0xa04D113Ec35ee0Ad544b828ba1515Cf7Ac3F6F30";

// Smart contract ABI (Application Binary Interface)
const ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_jobId",
				"type": "uint256"
			}
		],
		"name": "acceptJob",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_jobId",
				"type": "uint256"
			}
		],
		"name": "completeJob",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "jobId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "freelancer",
				"type": "address"
			}
		],
		"name": "JobAccepted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "jobId",
				"type": "uint256"
			}
		],
		"name": "JobCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "jobId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "client",
				"type": "address"
			}
		],
		"name": "JobPosted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_desc",
				"type": "string"
			}
		],
		"name": "postJob",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getJob",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "enum FreelanceMarketplace.JobStatus",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "jobCounter",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "jobs",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "title",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "address payable",
				"name": "client",
				"type": "address"
			},
			{
				"internalType": "address payable",
				"name": "freelancer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "budget",
				"type": "uint256"
			},
			{
				"internalType": "enum FreelanceMarketplace.JobStatus",
				"name": "status",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

// Global variables for blockchain interaction
let provider;
let signer;
let contract;
let jobsCache = [];
let currentSortOrder = 'newest';

// Connect to MetaMask wallet and initialize contract
async function connectWallet() {
	try {
		// Check if MetaMask is installed
		if (typeof window.ethereum !== 'undefined') {
			console.log('MetaMask is installed!');
			
			// Request account access from user
			console.log('Requesting account access...');
			const accounts = await window.ethereum.request({ 
				method: 'eth_requestAccounts',
				params: [] // Explicitly request accounts
			});
			
			if (!accounts || accounts.length === 0) {
				throw new Error('No accounts found or user rejected the connection');
			}

			const account = accounts[0];
			console.log('Connected account:', account);

			// Initialize ethers provider and contract
			provider = new ethers.BrowserProvider(window.ethereum);
			signer = await provider.getSigner();
			contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

			// Update UI with connected address
			document.getElementById("wallet-address").innerText = `Connected: ${account}`;
			document.getElementById("wallet-address").style.color = '#2ecc71';

			console.log("✅ Wallet connected successfully");
			console.log("Provider:", provider);
			console.log("Signer:", signer);
			console.log("Contract:", contract);

			// Load jobs after connecting
			await showJobsByStatus('current');
		} else {
			console.log('MetaMask is not installed');
			alert("Please install MetaMask to use this application.\nVisit: https://metamask.io/");
		}
	} catch (error) {
		console.error("❌ Error connecting wallet:", error);
		if (error.code === 4001) {
			alert("You rejected the connection request. Please connect your wallet to use this application.");
		} else if (error.code === -32002) {
			alert("MetaMask connection request already pending. Please check your MetaMask extension.");
		} else {
			alert(`Failed to connect wallet: ${error.message}`);
		}
		// Reset wallet connection status
		document.getElementById("wallet-address").innerText = 'No account connected';
		document.getElementById("wallet-address").style.color = '#e74c3c';
	}
}

// Post a new job to the blockchain
async function postJob() {
	if (!contract) {
		alert("Please connect your wallet first.");
		return;
	}

	const title = document.getElementById("title").value;
	const desc = document.getElementById("desc").value;
	const budget = document.getElementById("budget").value;

	if (!title || !desc || !budget) {
		alert("Please fill in all job details.");
		return;
	}

	try {
		// Convert ETH value to Wei and post job
		const ethValue = ethers.parseEther(budget);
		const tx = await contract.postJob(title, desc, { value: ethValue });
		console.log("⏳ Waiting for transaction...");
		await tx.wait();
		alert("✅ Job posted successfully!");
		
		// Refresh the jobs list
		await showJobsByStatus('current');
	} catch (error) {
		console.error("❌ Error posting job:", error);
		alert("Failed to post job.");
	}
}

// Display jobs based on their status (current or completed)
async function showJobsByStatus(type) {
	if (!contract) {
		alert("Please connect your wallet first.");
		return;
	}

	// Update tab buttons
	document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
	document.querySelector(`[onclick="showJobsByStatus('${type}')"]`).classList.add('active');

	// Hide both lists
	document.getElementById('currentJobs').classList.remove('visible');
	document.getElementById('completedJobs').classList.remove('visible');

	try {
		// Fetch all jobs and cache them
		const jobCount = await contract.jobCounter();
		console.log("Total number of jobs:", jobCount.toString());
		
		jobsCache = [];
		for (let i = 0; i < jobCount; i++) {
			console.log(`Fetching job #${i}`);
			const job = await contract.getJob(i);
			jobsCache.push({
				id: i,
				title: job[0],
				description: job[1],
				client: job[2],
				freelancer: job[3],
				budget: job[4],
				status: job[5]
			});
		}

		// Sort and display jobs
		sortJobs(currentSortOrder, false);
		document.getElementById(`${type}Jobs`).classList.add('visible');
	} catch (error) {
		console.error("❌ Error loading jobs:", error);
		alert(`Failed to load jobs. Error: ${error.message}`);
	}
}

// Render jobs from cache to the UI
function renderJobs() {
	const currentJobsList = document.getElementById("currentJobs");
	const completedJobsList = document.getElementById("completedJobs");
	
	let currentJobsHtml = "<h3>Current Jobs</h3>";
	let completedJobsHtml = "<h3>Completed Jobs</h3>";
	let hasCurrentJobs = false;
	let hasCompletedJobs = false;

	// Generate HTML for each job
	for (const job of jobsCache) {
		const jobStatus = ["Open", "InProgress", "Completed"];
		const statusClass = job.status === 0 ? "open" : job.status === 1 ? "in-progress" : "completed";
		
		const jobHtml = `
			<div class="job-item" onclick="viewJobFromList(${job.id})">
				<strong>Job #${job.id}</strong> - ${job.title}
				<br>
				<small>Budget: ${ethers.formatEther(job.budget)} ETH</small>
				<br>
				<span class="status ${statusClass}">${jobStatus[job.status]}</span>
			</div>
		`;

		// Sort jobs into current and completed lists
		if (job.status === 2) {
			completedJobsHtml += jobHtml;
			hasCompletedJobs = true;
		} else {
			currentJobsHtml += jobHtml;
			hasCurrentJobs = true;
		}
	}

	// Show empty state messages if needed
	if (!hasCurrentJobs) {
		currentJobsHtml += "<p>No current jobs available.</p>";
	}
	if (!hasCompletedJobs) {
		completedJobsHtml += "<p>No completed jobs yet.</p>";
	}

	// Update the UI
	currentJobsList.innerHTML = currentJobsHtml;
	completedJobsList.innerHTML = completedJobsHtml;
}

// Sort jobs by newest or oldest first
function sortJobs(order, shouldRender = true) {
	currentSortOrder = order;
	
	jobsCache.sort((a, b) => {
		if (order === 'newest') {
			return b.id - a.id; // Newer jobs (higher IDs) first
		} else {
			return a.id - b.id; // Older jobs (lower IDs) first
		}
	});

	if (shouldRender) {
		renderJobs();
	}
}

// Clear the jobs list from view
function clearJobsList() {
	if (confirm("Are you sure you want to clear the jobs list? This will only hide the jobs from your view.")) {
		jobsCache = [];
		renderJobs();
	}
}

// Accept a job as a freelancer
async function acceptJob() {
	if (!contract) {
		alert("Please connect your wallet first.");
		return;
	}

	const jobId = document.getElementById("acceptJobId").value;
	if (!jobId && jobId !== "0") {
		alert("Please enter a job ID.");
		return;
	}

	try {
		// Verify job exists
		console.log("Checking job:", jobId);
		const jobCount = await contract.jobCounter();
		console.log("Total jobs:", jobCount.toString());
		
		if (jobId >= jobCount) {
			alert(`Job ID ${jobId} does not exist. Available job IDs are 0 to ${jobCount - 1}`);
			return;
		}

		// Get and display job details
		const job = await contract.getJob(jobId);
		console.log("Attempting to accept job with current details:", {
			id: jobId,
			title: job[0],
			description: job[1],
			client: job[2],
			freelancer: job[3],
			budget: ethers.formatEther(job[4]),
			status: ["Open", "InProgress", "Completed"][job[5]]
		});

		// Get current wallet address
		const address = await signer.getAddress();
		console.log("Current wallet address:", address);

		// Accept the job
		const tx = await contract.acceptJob(jobId);
		console.log("⏳ Transaction sent:", tx.hash);
		console.log("Waiting for transaction confirmation...");
		await tx.wait();
		console.log("✅ Transaction confirmed!");
		alert("✅ Job accepted successfully!");
		
		// Refresh views and clear input
		await showJobsByStatus('current');
		document.getElementById("acceptJobId").value = "";
		
		if (document.getElementById("jobId").value === jobId) {
			await viewJob();
		}
	} catch (error) {
		console.error("❌ Error accepting job:", error);
		alert("Failed to accept job. Note: This error is expected during testing - the contract prevents clients from accepting their own jobs.");
	}
}

// Complete a job and transfer payment
async function completeJob() {
	if (!contract) {
		alert("Please connect your wallet first.");
		return;
	}

	const jobId = document.getElementById("completeJobId").value;
	if (!jobId && jobId !== "0") {
		alert("Please enter a job ID.");
		return;
	}

	try {
		// Verify job exists
		console.log("Checking job:", jobId);
		const jobCount = await contract.jobCounter();
		console.log("Total jobs:", jobCount.toString());
		
		if (jobId >= jobCount) {
			alert(`Job ID ${jobId} does not exist. Available job IDs are 0 to ${jobCount - 1}`);
			return;
		}

		// Get job details
		const job = await contract.getJob(jobId);
		console.log("Job details:", job);

		// Complete the job
		console.log("Sending complete job transaction...");
		const tx = await contract.completeJob(jobId);
		console.log("⏳ Transaction sent:", tx.hash);
		console.log("Waiting for transaction confirmation...");
		await tx.wait();
		console.log("✅ Transaction confirmed!");
		alert("✅ Job completed successfully!");
		
		// Refresh views and clear input
		await showJobsByStatus('completed');
		document.getElementById("completeJobId").value = "";
		
		if (document.getElementById("jobId").value === jobId) {
			await viewJob();
		}
	} catch (error) {
		console.error("❌ Error completing job:", error);
		alert("Failed to complete job. Note: This error is expected during testing - the contract requires job to be in progress.");
	}
}

// View detailed information about a specific job
async function viewJob() {
	if (!contract) {
		alert("Please connect your wallet first.");
		return;
	}

	const jobId = document.getElementById("jobId").value;
	if (!jobId && jobId !== "0") {
		alert("Please enter a job ID.");
		return;
	}

	try {
		const job = await contract.getJob(jobId);
		const jobStatus = ["Open", "InProgress", "Completed"];
		
		const jobDetailsHtml = `
			<h3>Job #${jobId}</h3>
			<p><strong>Title:</strong> ${job[0]}</p>
			<p><strong>Description:</strong> ${job[1]}</p>
			<p><strong>Client:</strong> ${job[2]}</p>
			<p><strong>Freelancer:</strong> ${job[3] === "0x0000000000000000000000000000000000000000" ? "Not assigned" : job[3]}</p>
			<p><strong>Budget:</strong> ${ethers.formatEther(job[4])} ETH</p>
			<p><strong>Status:</strong> ${jobStatus[job[5]]}</p>
		`;

		const jobDetailsElement = document.getElementById("jobDetails");
		jobDetailsElement.innerHTML = jobDetailsHtml;
		jobDetailsElement.classList.add("visible");
	} catch (error) {
		console.error("❌ Error viewing job:", error);
		alert("Failed to view job.");
	}
}

// Helper function to view job details from the jobs list
async function viewJobFromList(jobId) {
	document.getElementById("jobId").value = jobId;
	await viewJob();
}

// Setup MetaMask event listeners
if (window.ethereum) {
	// Handle account changes
	window.ethereum.on('accountsChanged', async (accounts) => {
		console.log('Account changed:', accounts[0]);
		if (accounts.length > 0) {
			document.getElementById("wallet-address").innerText = `Connected: ${accounts[0]}`;
			document.getElementById("wallet-address").style.color = '#2ecc71';
			
			// Reinitialize the contract with new signer
			provider = new ethers.BrowserProvider(window.ethereum);
			signer = await provider.getSigner();
			contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
			
			// Refresh the current view
			await showJobsByStatus('current');
		} else {
			document.getElementById("wallet-address").innerText = 'No account connected';
			document.getElementById("wallet-address").style.color = '#e74c3c';
		}
	});

	// Handle network changes
	window.ethereum.on('chainChanged', (chainId) => {
		console.log('Network changed:', chainId);
		// Reload the page on chain change as recommended by MetaMask
		window.location.reload();
	});
}

// Remove automatic wallet connection on page load
window.removeEventListener('load', connectWallet);

