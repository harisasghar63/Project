<!DOCTYPE html>
<html>
<head>
    <title>Freelance DApp</title>
    <link rel="stylesheet" href="style.css" />
</head>
<body>
    <h1>Decentralized Freelance Job Marketplace</h1>
    <button onclick="connectWallet()">Connect Wallet</button>
    <div id="wallet-address"></div>

    <h2>Post a Job</h2>
    <input id="title" placeholder="Title" />
    <input id="desc" placeholder="Description" />
    <input id="budget" placeholder="Budget in ETH" />
    <button onclick="postJob()">Post Job</button>

    <script src="https://cdn.jsdelivr.net/npm/ethers@6.6.2/dist/ethers.umd.min.js"></script>
    <script src="app.js"></script>
</body>
</html>
