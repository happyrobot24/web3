
const {ether} = require("hardhat")

async function main() {
    // create factory and deploy contract
    const FundMeFactory = await ethers.getContractFactory("FundMe")
    console.log("Deploying FundMe...")
    // 创建一个新的合约实例，并部署到链上. 参数10是构造函数的参数，表示目标金额为10美元
    const fundMe = await FundMeFactory.deploy(10)
    // 等待链上部署完成,广播 交易并等待被链上确认
    await fundMe.waitForDeployment()
    console.log("FundMe deployed to:", fundMe.target)

    // 等待5个确认，确保 Etherscan 已同步合约字节码
    console.log("Waiting for 5 confirmations before verification...")
    const deploymentTx = fundMe.deploymentTransaction()
    if (deploymentTx) {
        await deploymentTx.wait(5)
        console.log("5 confirmations received, proceeding with verification...")
    }

    // 增加hre.run verify插件，自动在etherscan上验证合约
    // npx hardhat verify --network sepolia "0xDC45ab75292022E9775C922cF73A546fAe608A7B" "10"
    await hre.run("verify:verify", {
        address: fundMe.target,
        constructorArguments: [10]
    })

    // 调用合约的fund函数，发送1个eth
    // const tx = await fundMe.fund({value: ether("1")})
    // // 等待交易被链上确认
    // await tx.wait()
    // console.log("Funded with 1 ETH")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })