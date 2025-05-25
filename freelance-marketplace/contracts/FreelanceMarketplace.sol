// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FreelanceMarketplace {
    address public owner;

    enum JobStatus { Open, InProgress, Completed }

    struct Job {
        uint id;
        string title;
        string description;
        address payable client;
        address payable freelancer;
        uint256 budget;
        JobStatus status;
    }

    uint public jobCounter;
    mapping(uint => Job) public jobs;

    event JobPosted(uint jobId, address indexed client);
    event JobAccepted(uint jobId, address indexed freelancer);
    event JobCompleted(uint jobId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function postJob(string calldata _title, string calldata _desc) external payable {
        require(msg.value > 0, "Budget must be > 0");

        jobs[jobCounter] = Job(
            jobCounter,
            _title,
            _desc,
            payable(msg.sender),
            payable(address(0)),
            msg.value,
            JobStatus.Open
        );

        emit JobPosted(jobCounter, msg.sender);
        jobCounter++;
    }

    function acceptJob(uint _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.Open, "Job not open");

        job.freelancer = payable(msg.sender);
        job.status = JobStatus.InProgress;

        emit JobAccepted(_jobId, msg.sender);
    }

    function completeJob(uint _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.status == JobStatus.InProgress, "Not in progress");

        job.status = JobStatus.Completed;
        job.freelancer.transfer(job.budget);

        emit JobCompleted(_jobId);
    }

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
