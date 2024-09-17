const express = require('express');
const path = require('path');
const { mnemonicNew, mnemonicToWalletKey } = require('ton-crypto');
const { WalletContractV4, Address } = require('ton');

const app = express();
const port = 3000;

// 添加 CORS 支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://tonwallet-jade.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static('public'));
app.use(express.json());

app.post('/generate', async (req, res) => {
  try {
    const { count } = req.body;
    if (count > 100) {
      return res.status(400).json({ error: '最多可以生成100个钱包' });
    }

    console.log(`Generating ${count} wallets`);
    const wallets = [];

    for (let i = 0; i < count; i++) {
      let mnemonic;
      try {
        mnemonic = await mnemonicNew();
      } catch (mnemonicError) {
        console.error('Error generating mnemonic:', mnemonicError);
        throw new Error(`Failed to generate mnemonic: ${mnemonicError.message}`);
      }

      if (!mnemonic || !Array.isArray(mnemonic) || mnemonic.length === 0) {
        throw new Error('Invalid mnemonic generated');
      }

      let key;
      try {
        key = await mnemonicToWalletKey(mnemonic);
      } catch (keyError) {
        console.error('Error generating wallet key:', keyError);
        throw new Error(`Failed to generate wallet key: ${keyError.message}`);
      }

      if (!key || !key.publicKey || !key.secretKey) {
        throw new Error('Invalid wallet key generated');
      }

      let wallet;
      try {
        wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
      } catch (walletError) {
        console.error('Error creating wallet contract:', walletError);
        throw new Error(`Failed to create wallet contract: ${walletError.message}`);
      }

      if (!wallet || !wallet.address) {
        throw new Error('Invalid wallet contract created');
      }

      let uqAddress;
      try {
        const rawAddress = wallet.address.toString();
        uqAddress = 'UQ' + rawAddress.slice(2);
      } catch (uqAddressError) {
        console.error('Error creating UQ address:', uqAddressError);
        throw new Error(`Failed to create UQ address: ${uqAddressError.message}`);
      }

      wallets.push({
        mnemonic: mnemonic.join(' '),
        address: uqAddress,
        privateKey: key.secretKey.toString('hex')
      });
    }

    res.json(wallets);
  } catch (error) {
    console.error('Error generating wallets:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// 替换 app.listen 部分
if (process.env.VERCEL) {
  // Vercel 环境下，导出 app
  module.exports = app;
} else {
  // 本地环境下，启动服务器
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}