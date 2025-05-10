/**
 * 农产品上传数据传递模块
 * 负责收集上传页面的农产品信息和平台选择，并格式化为JSON传递给预览页面
 */

// 当文档加载完成时初始化
document.addEventListener('DOMContentLoaded', function () {
    console.log('数据传递模块已加载');

    // 判断当前页面
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'upload.html') {
        // 在上传页面，初始化"下一步"按钮监听
        initNextButtonListener();
    } else if (currentPage === 'preview.html') {
        // 在预览页面，从 localStorage 加载数据并显示
        loadProductDataToPreview();

        // 初始化JSON查看区域
        initJsonViewer();

        // 初始化AI优化按钮
        initAIOptimizationButton();
    }
});

/**
 * 初始化"下一步"按钮的点击事件监听
 */
function initNextButtonListener() {
    const nextButton = document.getElementById('next-button');

    if (!nextButton) {
        console.error('未找到"下一步"按钮');
        return;
    }

    console.log('已初始化"下一步"按钮监听器');

    // 监听按钮点击事件
    nextButton.addEventListener('click', function () {
        console.log('下一步按钮被点击');

        // 收集数据并保存到 localStorage
        collectAndSaveProductData();
    });
}

/**
 * 收集农产品信息和平台选择，保存为JSON格式
 */
function collectAndSaveProductData() {
    // 从表单获取农产品信息
    const productTitle = document.getElementById('product-title')?.value || '';
    const productIntro = document.getElementById('product-intro')?.value || '';
    const productFeatures = document.getElementById('product-features')?.value || '';
    const productTaste = document.getElementById('product-taste')?.value || '';
    const productNutrition = document.getElementById('product-nutrition')?.value || '';
    const productSuggestion = document.getElementById('product-suggestion')?.value || '';

    // 处理特点字段，将其转换为数组
    const featuresArray = parseFeaturesToArray(productFeatures);

    // 将数据结构化为JSON对象
    const productData = {
        product_info: {
            title: productTitle,
            introduction: productIntro,
            features: featuresArray,
            taste_experience: productTaste,
            nutritional_value: productNutrition,
            usage_suggestions: productSuggestion
        },
        // 默认平台为小红书，会在预览页面根据用户选择更新
        platform: "xiaohongshu"
    };

    console.log('收集的农产品数据:', productData);

    // 将数据保存到 localStorage (会在预览页面读取)
    localStorage.setItem('productData', JSON.stringify(productData));
}

/**
 * 将特点文本解析为数组
 * @param {string} featuresText - 特点文本
 * @returns {string[]} 特点数组
 */
function parseFeaturesToArray(featuresText) {
    if (!featuresText || typeof featuresText !== 'string') {
        return [];
    }

    // 尝试通过常见的分隔符分割文本
    // 首先检查是否有明显的分行
    if (featuresText.includes('\n')) {
        return featuresText.split('\n')
            .map(item => item.trim())
            .filter(item => item.length > 0);
    }

    // 检查是否使用逗号或分号分隔
    if (featuresText.includes('，') || featuresText.includes(',')) {
        return featuresText.split(/[,，]/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
    }

    if (featuresText.includes('；') || featuresText.includes(';')) {
        return featuresText.split(/[;；]/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
    }

    // 如果没有明显的分隔符，作为单个项返回
    return [featuresText.trim()];
}

/**
 * 在预览页面加载产品数据并更新平台选择
 */
function loadProductDataToPreview() {
    console.log('尝试加载产品数据到预览页面');

    // 从localStorage获取产品数据
    const productDataStr = localStorage.getItem('productData');

    if (!productDataStr) {
        console.warn('未找到产品数据');
        return;
    }

    try {
        // 解析产品数据
        const productData = JSON.parse(productDataStr);
        console.log('已加载产品数据:', productData);

        // 监听模板选择变化，更新platform字段
        initTemplateSelectionListener(productData);

        // 添加监听器，检测编辑按钮状态变化
        initEditButtonListener(productData);

        // 创建隐藏的文本框来存储JSON数据
        createDataStorageElement(productData);

        // 更新JSON查看区域(如果存在)
        updateJsonViewerContent(productData);

        // 使用产品数据填充预览页面
        fillPreviewContent(productData);
    } catch (error) {
        console.error('解析产品数据失败:', error);
    }
}

/**
 * 使用产品数据填充预览页面的内容
 * @param {Object} productData - 产品数据对象
 */
function fillPreviewContent(productData) {
    if (!productData || !productData.product_info) return;

    const info = productData.product_info;

    // 填充静态内容区域
    const staticContent = document.getElementById('staticContent');
    if (staticContent) {
        // 填充标题
        const titleElement = staticContent.querySelector('h2');
        if (titleElement) {
            titleElement.textContent = info.title || '产品标题';
        }

        // 填充简介
        const introElement = staticContent.querySelector('h2 + p');
        if (introElement) {
            introElement.textContent = info.introduction || '产品简介';
        }

        // 填充产品特点
        const featuresElement = staticContent.querySelector('.text-\\[\\#9aa338\\] + p');
        if (featuresElement && Array.isArray(info.features)) {
            featuresElement.textContent = info.features.join('\n');
        }

        // 填充口感体验
        const tasteElement = staticContent.querySelector('.text-orange-700 + p');
        if (tasteElement) {
            tasteElement.textContent = info.taste_experience || '';
        }

        // 填充营养价值
        const nutritionElement = staticContent.querySelector('.text-blue-700 + p');
        if (nutritionElement) {
            nutritionElement.textContent = info.nutritional_value || '';
        }

        // 填充食用建议
        const suggestionElement = staticContent.querySelector('.text-purple-700 + p');
        if (suggestionElement) {
            suggestionElement.textContent = info.usage_suggestions || '';
        }
    }

    // 填充可编辑区域
    const contentEditor = document.getElementById('contentEditor');
    if (contentEditor) {
        const editorTitle = contentEditor.querySelector('h2');
        if (editorTitle) {
            editorTitle.textContent = info.title || '产品标题';
        }

        const editorIntro = contentEditor.querySelector('h2 + p');
        if (editorIntro) {
            editorIntro.textContent = info.introduction || '产品简介';
        }
    }
}

/**
 * 初始化模板选择监听器
 * @param {Object} productData - 产品数据对象
 */
function initTemplateSelectionListener(productData) {
    // 找到所有模板选项
    const templateOptions = document.querySelectorAll('.template-option');

    if (!templateOptions || templateOptions.length === 0) {
        console.warn('未找到模板选项元素');
        return;
    }

    // 为每个模板选项添加点击事件
    templateOptions.forEach(option => {
        option.addEventListener('click', function () {
            // 获取模板名称
            const templateText = option.querySelector('.text-white')?.textContent.trim() || '';

            // 根据模板名称设置platform值
            if (templateText.includes('小红书')) {
                productData.platform = 'xiaohongshu';
            } else if (templateText.includes('微信')) {
                productData.platform = 'weixin';
            } else if (templateText.includes('抖音')) {
                productData.platform = 'douyin';
            }

            console.log('已更新平台选择:', productData.platform);

            // 更新隐藏的数据存储元素
            updateDataStorageElement(productData);

            // 更新JSON查看区域(如果存在)
            updateJsonViewerContent(productData);
        });
    });
}

/**
 * 初始化编辑按钮监听器
 * @param {Object} productData - 产品数据对象
 */
function initEditButtonListener(productData) {
    const toggleEditBtn = document.getElementById('toggleEditBtn');

    if (!toggleEditBtn) {
        console.warn('未找到编辑按钮');
        return;
    }

    toggleEditBtn.addEventListener('click', function () {
        // 检查编辑区域是否可见
        const contentEditor = document.getElementById('contentEditor');
        const isEditorVisible = contentEditor && contentEditor.style.display !== 'none';

        if (isEditorVisible) {
            console.log('编辑区域已显示，更新JSON数据');
            // 更新 JSON 数据区域
            updateDataStorageElement(productData);

            // 更新JSON查看区域(如果存在)
            updateJsonViewerContent(productData);
        }
    });
}

/**
 * 创建隐藏的文本框来存储JSON数据
 * @param {Object} productData - 产品数据对象
 */
function createDataStorageElement(productData) {
    // 检查是否已存在该元素
    let dataStorage = document.getElementById('product-data-json');

    if (!dataStorage) {
        // 创建隐藏的textarea元素
        dataStorage = document.createElement('textarea');
        dataStorage.id = 'product-data-json';
        dataStorage.style.display = 'none';
        dataStorage.setAttribute('aria-hidden', 'true');
        document.body.appendChild(dataStorage);
    }

    // 填充JSON数据
    updateDataStorageElement(productData);
}

/**
 * 更新JSON数据存储元素
 * @param {Object} productData - 产品数据对象
 */
function updateDataStorageElement(productData) {
    const dataStorage = document.getElementById('product-data-json');

    if (dataStorage) {
        // 更新数据
        dataStorage.value = JSON.stringify(productData, null, 2);
        console.log('已更新JSON数据:', dataStorage.value);

        // 触发自定义事件，通知其他组件数据已更新
        document.dispatchEvent(new CustomEvent('productDataUpdated', {
            detail: { productData }
        }));
    }
}

/**
 * 初始化JSON查看区域的交互功能
 */
function initJsonViewer() {
    const toggleJsonBtn = document.getElementById('toggleJsonBtn');
    const jsonDataArea = document.getElementById('jsonDataArea');
    const jsonDataTextarea = document.getElementById('jsonDataTextarea');
    const updateJsonBtn = document.getElementById('updateJsonBtn');

    if (!toggleJsonBtn || !jsonDataArea || !jsonDataTextarea) {
        console.warn('未找到JSON查看区域元素');
        return;
    }

    // 切换JSON数据区域的显示/隐藏
    toggleJsonBtn.addEventListener('click', function () {
        const isHidden = jsonDataArea.classList.contains('hidden');

        if (isHidden) {
            jsonDataArea.classList.remove('hidden');
            toggleJsonBtn.querySelector('i.fas').classList.remove('fa-chevron-down');
            toggleJsonBtn.querySelector('i.fas').classList.add('fa-chevron-up');

            // 加载当前数据
            const dataStorage = document.getElementById('product-data-json');
            if (dataStorage && jsonDataTextarea) {
                jsonDataTextarea.value = dataStorage.value;
            }
        } else {
            jsonDataArea.classList.add('hidden');
            toggleJsonBtn.querySelector('i.fas').classList.remove('fa-chevron-up');
            toggleJsonBtn.querySelector('i.fas').classList.add('fa-chevron-down');
        }
    });

    // 更新JSON数据按钮
    if (updateJsonBtn) {
        updateJsonBtn.addEventListener('click', function () {
            if (!jsonDataTextarea.value.trim()) {
                alert('JSON数据不能为空！');
                return;
            }

            try {
                // 解析用户输入的JSON
                const updatedData = JSON.parse(jsonDataTextarea.value);

                // 验证数据结构
                if (!updatedData.product_info || !updatedData.platform) {
                    alert('JSON数据结构不正确！必须包含product_info和platform字段。');
                    return;
                }

                // 更新存储和UI
                updateDataStorageElement(updatedData);

                // 保存到localStorage
                localStorage.setItem('productData', JSON.stringify(updatedData));

                // 显示成功提示
                showUpdateSuccessMessage();
            } catch (error) {
                alert('JSON格式错误: ' + error.message);
            }
        });
    }
}

/**
 * 更新JSON查看区域的内容
 * @param {Object} productData - 产品数据对象
 */
function updateJsonViewerContent(productData) {
    const jsonDataTextarea = document.getElementById('jsonDataTextarea');

    if (jsonDataTextarea && productData) {
        jsonDataTextarea.value = JSON.stringify(productData, null, 2);
    }
}

/**
 * 显示更新成功消息
 */
function showUpdateSuccessMessage() {
    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.textContent = '数据已更新';
    messageElement.className = 'update-message bg-green-500 text-white px-3 py-2 rounded-lg fixed bottom-20 left-1/2 transform -translate-x-1/2';
    messageElement.style.zIndex = '9999';
    document.body.appendChild(messageElement);

    // 淡出效果
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 500);
    }, 2000);
}

/**
 * 初始化AI优化按钮
 */
function initAIOptimizationButton() {
    const generateCopyBtn = document.getElementById('generateCopyBtn');
    const aiGeneratingContainer = document.getElementById('aiGeneratingContainer');
    const aiProgressBar = document.getElementById('aiProgressBar');

    if (!generateCopyBtn) {
        console.warn('未找到AI优化按钮');
        return;
    }

    generateCopyBtn.addEventListener('click', async function () {
        // 获取当前产品数据
        const dataStorage = document.getElementById('product-data-json');
        if (!dataStorage || !dataStorage.value) {
            showErrorMessage('未找到产品数据');
            return;
        }

        try {
            const productData = JSON.parse(dataStorage.value);

            // 显示生成中状态
            if (aiGeneratingContainer) {
                aiGeneratingContainer.classList.remove('hidden');
            }

            // 模拟进度条
            let progress = 0;
            const progressInterval = setInterval(() => {
                progress += 5;
                if (progress > 90) progress = 90; // 保留最后10%给实际完成时

                if (aiProgressBar) {
                    aiProgressBar.style.width = progress + '%';
                }
            }, 300);

            // 调用Coze工作流API
            try {
                const result = await callCozeWorkflow(productData);

                // 清除进度条动画
                clearInterval(progressInterval);

                // 设置进度条为100%
                if (aiProgressBar) {
                    aiProgressBar.style.width = '100%';
                }

                // 处理返回结果
                handleCozeResult(result);

                // 隐藏生成中状态
                setTimeout(() => {
                    if (aiGeneratingContainer) {
                        aiGeneratingContainer.classList.add('hidden');
                    }

                    // 显示成功消息
                    showAISuccessMessage();
                }, 1000);

            } catch (error) {
                console.error('调用Coze工作流失败:', error);
                clearInterval(progressInterval);

                // 显示错误消息
                showErrorMessage('AI优化失败，请稍后重试');

                // 隐藏生成中状态
                if (aiGeneratingContainer) {
                    aiGeneratingContainer.classList.add('hidden');
                }
            }

        } catch (error) {
            console.error('解析产品数据失败:', error);
            showErrorMessage('数据格式错误');
        }
    });
}

/**
 * 调用Coze工作流
 * @param {Object} productData - 产品数据
 * @returns {Promise<Object>} - 工作流返回结果
 */
async function callCozeWorkflow(productData) {
    console.log('调用Coze工作流，参数:', productData);

    try {
        // 使用fetch API调用Coze工作流API
        const response = await fetch('https://api.coze.cn/v1/workflow/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'pat_RPTiZKKPeJltrdxulFNMc3lquYb3XNvm9MZYIBMdtAKZJ5adyjyIkDsxqpJhMrSD'
            },
            body: JSON.stringify({
                workflow_id: '7497171481404244006',
                parameters: productData
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API响应错误:', errorText);
            throw new Error(`API调用失败: ${response.status} - ${errorText}`);
        }

        // 直接读取完整响应体为JSON
        const result = await response.json();
        console.log('API返回完整响应:', result);

        return result;

    } catch (error) {
        console.error('Coze API调用失败:', error);
        throw error;
    }
}

/**
 * 处理Coze工作流返回的结果
 * @param {Object} result - Coze工作流返回的结果
 */
function handleCozeResult(result) {
    console.log('处理Coze工作流返回结果:', result);

    if (!result) {
        console.error('无效的Coze工作流返回结果');
        return;
    }

    // 提取实际文案内容
    let content = extractContentFromCozeResponse(result);

    // 输出解析后的内容，方便调试
    console.log('提取后的文案内容:', content);

    if (!content) {
        console.error('无法提取Coze工作流返回内容');
        return;
    }

    // 获取内容编辑区域
    const contentEditor = document.getElementById('contentEditor');
    const staticContent = document.getElementById('staticContent');

    if (!contentEditor || !staticContent) {
        console.error('未找到内容编辑区域');
        return;
    }

    // 显示编辑区域，隐藏静态内容
    contentEditor.style.display = 'block';
    staticContent.style.display = 'none';

    // 将返回内容处理为HTML格式
    const formattedContent = formatCozeContent(content);

    // 输出格式化后的HTML内容，方便调试
    console.log('格式化后的HTML内容:', formattedContent.substring(0, 500) + '...');

    // 将Coze返回的内容填充到编辑区域
    contentEditor.innerHTML = formattedContent;

    // 显示编辑工具栏
    const editorToolbar = document.getElementById('editorToolbar');
    if (editorToolbar) {
        editorToolbar.classList.remove('hidden');
    }
}

/**
 * 从Coze API响应中提取实际的文案内容
 * @param {Object|string} response - API响应
 * @returns {string} - 提取的文案内容
 */
function extractContentFromCozeResponse(response) {
    try {
        // 如果是字符串，尝试解析JSON
        if (typeof response === 'string') {
            try {
                response = JSON.parse(response);
            } catch (e) {
                // 如果不是有效的JSON，直接返回原文本
                return response;
            }
        }

        // 处理标准Coze API响应格式
        if (response.data) {
            // 如果data字段是字符串且包含JSON转义符号
            if (typeof response.data === 'string' && response.data.includes('\\')) {
                // 尝试进行JSON解析
                try {
                    // 先移除两端引号(如果有)
                    let cleanData = response.data;
                    if (cleanData.startsWith('"') && cleanData.endsWith('"')) {
                        cleanData = cleanData.slice(1, -1);
                    }

                    // 解析JSON数组或对象
                    if (cleanData.startsWith('[') || cleanData.startsWith('{')) {
                        const parsedData = JSON.parse(cleanData);

                        // 如果是数组，拼接所有元素
                        if (Array.isArray(parsedData)) {
                            return parsedData.join('');
                        }

                        // 如果是对象，尝试提取文本内容
                        if (typeof parsedData === 'object') {
                            // 尝试不同的可能字段名
                            const possibleFields = ['text', 'content', 'message', 'output'];
                            for (const field of possibleFields) {
                                if (parsedData[field]) {
                                    return parsedData[field];
                                }
                            }
                            // 如果没有找到特定字段，返回整个对象的字符串表示
                            return JSON.stringify(parsedData);
                        }
                    }

                    // 清理转义字符
                    return cleanData
                        .replace(/\\n/g, '\n')
                        .replace(/\\"/g, '"')
                        .replace(/\\\\/g, '\\');

                } catch (e) {
                    console.error('解析data字段失败:', e);
                    // 返回原始data内容，后续会做格式化处理
                    return response.data;
                }
            }

            // 如果data不是字符串或没有转义符号
            return typeof response.data === 'string'
                ? response.data
                : JSON.stringify(response.data);
        }

        // 检查其他可能的字段
        const possibleFields = ['content', 'text', 'message', 'output', 'response'];
        for (const field of possibleFields) {
            if (response[field]) {
                return typeof response[field] === 'string'
                    ? response[field]
                    : JSON.stringify(response[field]);
            }
        }

        // 如果无法找到任何有效内容，返回整个响应的字符串表示
        return JSON.stringify(response);

    } catch (error) {
        console.error('提取内容时出错:', error);
        return String(response);
    }
}

/**
 * 将Coze返回的内容格式化为HTML
 * @param {string} content - Coze返回的文本内容
 * @returns {string} - 格式化后的HTML内容
 */
function formatCozeContent(content) {
    // 如果内容已经是HTML，直接返回
    if (content.trim().startsWith('<') && content.includes('</')) {
        return content;
    }

    // 清理内容
    content = content
        // 移除可能的多余引号和转义字符
        .replace(/^["']|["']$/g, '')
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        // 移除可能的JSON前缀，如 ["output", "content..."]
        .replace(/^\["output",.*?,"/, '')
        // 移除结尾的引号和方括号
        .replace(/"\]$/, '');

    // 通过表情符号和标题特性识别小红书风格文案
    const isXiaohongshuStyle = content.includes('🍎') ||
        content.includes('💫') ||
        content.includes('👅') ||
        content.includes('——') ||
        content.includes('#');

    if (isXiaohongshuStyle) {
        // 处理小红书风格文案格式

        // 提取标题部分（通常包含表情符号和商品名）
        let title = '';
        const titleMatch = content.match(/(.+?)(?:\n|$)/);
        if (titleMatch) {
            title = titleMatch[1].trim();
        }

        // 提取标签（通常以#开头）
        const tags = [];
        const tagRegex = /#[^\s#]+/g;
        let match;
        while ((match = tagRegex.exec(content)) !== null) {
            tags.push(match[0]);
        }

        // 从内容中提取各个部分
        const sections = {
            '产品特点': '',
            '口感体验': '',
            '营养价值': '',
            '食用建议': ''
        };

        // 查找各部分内容
        let currentSection = '';
        const lines = content.split('\n');
        for (const line of lines) {
            // 检查是否是新部分的开始
            if (line.includes('产品特点') || line.includes('特点') || line.includes('🍎')) {
                currentSection = '产品特点';
                continue;
            } else if (line.includes('口感体验') || line.includes('口感') || line.includes('👅')) {
                currentSection = '口感体验';
                continue;
            } else if (line.includes('营养价值') || line.includes('营养') || line.includes('💪')) {
                currentSection = '营养价值';
                continue;
            } else if (line.includes('食用建议') || line.includes('吃法') || line.includes('🍽️')) {
                currentSection = '食用建议';
                continue;
            }

            // 如果有当前部分，添加内容
            if (currentSection && sections[currentSection] !== undefined) {
                sections[currentSection] += (sections[currentSection] ? '\n' : '') + line;
            }
        }

        // 构建HTML
        let html = `
        <div class="mb-4">
            <div class="mb-2 flex items-center">
                <span class="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mr-2"
                    style="background: linear-gradient(135deg, #ffcdd2, #ef9a9a); color: #c62828;">限时特惠</span>
                <span class="bg-green-100 text-green-600 text-xs font-bold px-2 py-1 rounded"
                    style="background: linear-gradient(135deg, #c8e6c9, #a5d6a7); color: #2e7d32;">有机认证</span>
            </div>
            <h2 class="text-lg font-bold mb-2">${title || '农产品推荐'}</h2>
            <p class="text-sm text-gray-700 leading-relaxed">${tags.join(' ')}</p>
        </div>`;

        // 添加标签部分
        html += `
        <div class="flex flex-wrap gap-2 mb-4">
            <span class="inline-block text-xs px-2 py-1 rounded-full font-medium"
                style="background: linear-gradient(135deg, #c8e6c9, #a5d6a7); color: #1b5e20;">有机认证</span>
            <span class="inline-block text-xs px-2 py-1 rounded-full font-medium"
                style="background: linear-gradient(135deg, #bbdefb, #90caf9); color: #0d47a1;">高山种植</span>
            <span class="inline-block text-xs px-2 py-1 rounded-full font-medium"
                style="background: linear-gradient(135deg, #fff9c4, #fff59d); color: #f57f17;">产地直发</span>
        </div>`;

        // 添加各部分内容
        if (sections['产品特点']) {
            html += `
            <div class="mb-5 border-l-4 pl-3 rounded-r-lg"
                style="border-color: #9aa338; background: linear-gradient(to right, rgba(154, 163, 56, 0.15), rgba(154, 163, 56, 0.05), transparent);">
                <h3 class="font-bold mb-2 text-[#9aa338]">🍎 产品特点</h3>
                <p class="text-sm text-gray-700 mb-3 leading-relaxed">${sections['产品特点'].replace(/\n/g, '<br>')}</p>
            </div>`;
        }

        if (sections['口感体验']) {
            html += `
            <div class="mb-5 border-l-4 pl-3 rounded-r-lg"
                style="border-color: #e67e22; background: linear-gradient(to right, rgba(230, 126, 34, 0.15), rgba(230, 126, 34, 0.05), transparent);">
                <h3 class="font-bold mb-2 text-orange-700">👅 口感体验</h3>
                <p class="text-sm text-gray-700 mb-3 leading-relaxed">${sections['口感体验'].replace(/\n/g, '<br>')}</p>
            </div>`;
        }

        if (sections['营养价值']) {
            html += `
            <div class="mb-5 border-l-4 pl-3 rounded-r-lg"
                style="border-color: #3498db; background: linear-gradient(to right, rgba(52, 152, 219, 0.15), rgba(52, 152, 219, 0.05), transparent);">
                <h3 class="font-bold mb-2 text-blue-700">💪 营养价值</h3>
                <p class="text-sm text-gray-700 mb-3 leading-relaxed">${sections['营养价值'].replace(/\n/g, '<br>')}</p>
            </div>`;
        }

        if (sections['食用建议']) {
            html += `
            <div class="mb-5 border-l-4 pl-3 rounded-r-lg"
                style="border-color: #9b59b6; background: linear-gradient(to right, rgba(155, 89, 182, 0.15), rgba(155, 89, 182, 0.05), transparent);">
                <h3 class="font-bold mb-2 text-purple-700">🍽️ 食用建议</h3>
                <p class="text-sm text-gray-700 mb-3 leading-relaxed">${sections['食用建议'].replace(/\n/g, '<br>')}</p>
            </div>`;
        }

        return html;
    }

    // 将换行符转换为<br>标签
    let html = content.replace(/\n/g, '<br>');

    // 创建基本的结构
    return `
        <div class="mb-4">
            <h2 class="text-lg font-bold mb-2">AI优化后的文案</h2>
            <p class="text-sm text-gray-700 leading-relaxed">
                ${html}
            </p>
        </div>
    `;
}

/**
 * 显示错误消息
 * @param {string} message - 错误消息
 */
function showErrorMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.className = 'error-message bg-red-500 text-white px-3 py-2 rounded-lg fixed bottom-20 left-1/2 transform -translate-x-1/2';
    messageElement.style.zIndex = '9999';
    document.body.appendChild(messageElement);

    // 淡出效果
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 500);
    }, 2000);
}

/**
 * 显示AI优化成功消息
 */
function showAISuccessMessage() {
    const messageElement = document.createElement('div');
    messageElement.textContent = 'AI优化完成';
    messageElement.className = 'success-message bg-indigo-500 text-white px-3 py-2 rounded-lg fixed bottom-20 left-1/2 transform -translate-x-1/2';
    messageElement.style.zIndex = '9999';
    document.body.appendChild(messageElement);

    // 淡出效果
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 0.5s ease';

        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 500);
    }, 2000);
} 
