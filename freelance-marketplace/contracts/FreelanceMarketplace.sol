// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FreelanceMarketplace
 * @dev A decentralized marketplace for freelance jobs where clients can post jobs and freelancers can accept and complete them
 * The contract handles job posting, acceptance, completion, and automatic payment distribution
 */
contract FreelanceMarketplace {
    // Address of the contract owner/administrator
    address public owner;

    // Represents the current state of a job
    enum JobStatus { 
        Open,       // Job is available for freelancers to accept
        InProgress, // Job has been accepted and is being worked on
        Completed   // Job is finished and payment has been released
    }

    // Structure to store job information
    struct Job {
        uint id;                    // Unique identifier for the job
        string title;              // Title of the job posting
        string description;        // Detailed description of the job
        address payable client;    // Address of the client who posted the job
        address payable freelancer; // Address of the freelancer who accepted the job
        uint256 budget;            // Amount of ETH allocated for the job
        JobStatus status;          // Current status of the job
    }

    // Counter to keep track of total jobs and generate unique IDs
    uint public jobCounter;
    
    // Mapping from job ID to Job struct
    mapping(uint => Job) public jobs;

    // Events to notify frontend of state changes
    event JobPosted(uint jobId, address indexed client);
    event JobAccepted(uint jobId, address indexed freelancer);
    event JobCompleted(uint jobId);

    // Ensures only the contract owner can call certain functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    /**
     * @dev Constructor sets the contract deployer as the owner
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Allows clients to post a new job with title and description
     * @param _title Title of the job
     * @param _desc Description of the job requirements
     * Requirements:
     * - Must send ETH with the transaction (job budget)
     */
    function postJob(string calldata _title, string calldata _desc) external payable {
        require(msg.value > 0, "Budget must be > 0");

        jobs[jobCounter] = Job(
            jobCounter,
            _title,
            _desc,
            payable(msg.sender),
            payable(address(0)),    // No freelancer assigned initially
            msg.value,
            JobStatus.Open
        );

        emit JobPosted(jobCounter, msg.sender);
        jobCounter++;
    }

    /**
     * @dev Allows freelancers to accept an open job
     * @param _jobId ID of the job to accept
     * Requirements:
     * - Job must be in Open status
     */
    function acceptJob(uint _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Open, "Job not open");

        job.freelancer = payable(msg.sender);
        job.status = JobStatus.InProgress;

        emit JobAccepted(_jobId, msg.sender);
    }

    /**
     * @dev Marks a job as completed and transfers the payment to the freelancer
     * @param _jobId ID of the job to complete
     * Requirements:
     * - Job must be in InProgress status
     */
    function completeJob(uint _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.InProgress, "Not in progress");

        job.status = JobStatus.Completed;
        job.freelancer.transfer(job.budget);  // Transfer payment to freelancer

        emit JobCompleted(_jobId);
    }

    /**
     * @dev Retrieves detailed information about a specific job
     * @param _id ID of the job to query
     * @return Job title, description, client address, freelancer address, budget, and status
     */
    function getJob(uint _id) external view returns (
        string memory, string memory, address, address, uint256, JobStatus
    ) {
        Job memory job = jobs[_id];
        return (
            job.title,
            job.description,
            job.client,
            job.freelancer,
            job.budget,
            job.status
        );
    }
}
