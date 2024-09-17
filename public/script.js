document.getElementById('generateBtn').addEventListener('click', async () => {
    const count = document.getElementById('walletCount').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '正在生成钱包...';

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ count: parseInt(count) }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error}`);
        }

        const wallets = await response.json();
        
        if (wallets.error) {
            throw new Error(wallets.error);
        }
        
        resultDiv.innerHTML = wallets.map((wallet, index) => `
            <div class="wallet-item">
                <h3>钱包 #${index + 1} <button class="copy-btn" onclick="copyWallet(${index})">复制</button></h3>
                <p><strong>助记词:</strong> <br><span class="mnemonic">${wallet.mnemonic}</span></p>
                <p><strong>地址:</strong> <br><span class="address">${wallet.address}</span></p>
                <p><strong>私钥:</strong> <br><span class="privateKey">${wallet.privateKey}</span></p>
            </div>
        `).join('');

        document.getElementById('exportBtn').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        resultDiv.innerHTML = '生成钱包时出错: ' + error.message;
    }
});

document.getElementById('exportBtn').addEventListener('click', () => {
    const resultDiv = document.getElementById('result');
    const wallets = resultDiv.querySelectorAll('.wallet-item');
    const csvContent = "data:text/csv;charset=utf-8,"
        + "助记词,地址,私钥\n"
        + Array.from(wallets).map(wallet => {
            const mnemonic = wallet.querySelector('.mnemonic').innerText;
            const address = wallet.querySelector('.address').innerText;
            const privateKey = wallet.querySelector('.privateKey').innerText;
            return `${mnemonic},${address},${privateKey}`;
        }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "wallets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('关注@NFTCPS的推特查看更多TON资讯');
    window.open('https://twitter.com/NFTCPS', '_blank');
});

function copyWallet(index) {
    const walletItem = document.querySelectorAll('.wallet-item')[index];
    const mnemonic = walletItem.querySelector('.mnemonic').innerText;
    const address = walletItem.querySelector('.address').innerText;
    const privateKey = walletItem.querySelector('.privateKey').innerText;
    const textToCopy = `助记词: ${mnemonic}\n地址: ${address}\n私钥: ${privateKey}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('复制成功');
    }).catch(err => {
        console.error('复制失败', err);
    });
}