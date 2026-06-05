
const {ethers} = require("hardhat")

async function verifyOnSepolia(contract, constructorArgs = []) {
    if (hre.network.name !== "sepolia") {
        console.log(`Skipping verification on network ${hre.network.name}`)
        return
    }

    if (!process.env.ETHERSCAN_API_KEY && !process.env.ETHERSCAN_APIKEY) {
        throw new Error("ETHERSCAN_API_KEY is required for sepolia verification")
    }

    // 等待5个确认，确保 Etherscan 已同步合约字节码
    console.log("Waiting for 5 confirmations before verification...")
    const deploymentTx = contract.deploymentTransaction()
    if (deploymentTx) {
        await deploymentTx.wait(5)
        console.log("5 confirmations received, proceeding with verification...")
    }

    // 增加hre.run verify插件，自动在etherscan上验证合约
    await hre.run("verify:verify", {
        address: contract.target,
        constructorArguments: constructorArgs
    })
}

async function main() {
    // create factory and deploy contract
    const FundMeFactory = await ethers.getContractFactory("FundMe")
    console.log("Deploying FundMe...")
    // 创建一个新的合约实例，并部署到链上. 参数10是构造函数的参数，表示目标金额为10美元
    const fundMe = await FundMeFactory.deploy(600)
    // 等待链上部署完成,广播 交易并等待被链上确认
    await fundMe.waitForDeployment()
    console.log("FundMe deployed to:", fundMe.target)

    await verifyOnSepolia(fundMe, [600])

    // init 2 accounts
    const [account1, account2] = await ethers.getSigners()
    console.log("Funding with account:", account1.address)

    // fund contract with first account
    const tx1 = await fundMe.fund({value: ethers.parseEther("0.02")})
    await tx1.wait()
    console.log("Funded 1 ETH from account:", account1.address)

    // check contract balance
    // ethers.provider 相当于 etherscan浏览器
    const balance = await ethers.provider.getBalance(fundMe.target)
    console.log("Contract balance:", ethers.formatEther(balance), "ETH")

    // fund contract with second account
    console.log("Funding with account:", account2.address)
    const tx2 = await fundMe.connect(account2).fund({value: ethers.parseEther("0.01")})
    await tx2.wait()
    console.log("Funded 2 ETH from account:", account2.address)

    // check contract balance again
    const balance2 = await ethers.provider.getBalance(fundMe.target)
    console.log("Contract balance after second funding:", ethers.formatEther(balance2), "ETH")

    // check funderToAmount mapping
    const amount1 = await fundMe.funderToAmount(account1.address)
    console.log(`Amount funded by ${account1.address}:`, ethers.formatEther(amount1), "ETH")

    const amount2 = await fundMe.funderToAmount(account2.address)
    console.log(`Amount funded by ${account2.address}:`, ethers.formatEther(amount2), "ETH")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })