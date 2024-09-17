const fetch = require('node-fetch');

async function generateWallet() {
  try {
    const response = await fetch('https://api.example.com/generate-wallet');
    const text = await response.text(); // 先将响应转换为文本

    console.log('API 响应内容:', text); // 打印 API 响应内容

    try {
      const data = JSON.parse(text); // 尝试解析 JSON
      // 处理 JSON 数据
      console.log('钱包生成成功:', data);
    } catch (jsonError) {
      // 捕获 JSON 解析错误
      console.error('解析 JSON 时出错:', jsonError);
      console.error('响应内容不是有效的 JSON:', text);
    }
  } catch (fetchError) {
    // 捕获其他错误
    console.error('请求时出错:', fetchError);
  }
}

generateWallet();