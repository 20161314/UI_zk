/**
 * 宣传图文预览页面 - 功能脚本
 * 处理图片轮播、AI生成文案、模板切换等功能
 */
document.addEventListener('DOMContentLoaded', function() {
    // 获取元素
    const carouselImage = document.getElementById('carouselImage');
    const carouselIndicators = document.getElementById('carouselIndicators');
    const prevImageBtn = document.getElementById('prevImageBtn');
    const nextImageBtn = document.getElementById('nextImageBtn');
    const generateCopyBtn = document.getElementById('generateCopyBtn');
    const aiGeneratingContainer = document.getElementById('aiGeneratingContainer');
    const aiProgressBar = document.getElementById('aiProgressBar');
    const previewTitle = document.querySelector('.text-lg.font-bold.mb-1');
    const previewDesc = document.querySelector('.text-sm.text-gray-700');
    const contentSections = document.querySelectorAll('.font-bold.mb-2 + .text-sm.text-gray-700');
    
    // 开关状态
    let isCopyOptimized = true;
    let isLayoutOptimized = true;
    let isTopicEnabled = false;
    
    // 初始化组件
    const uploadedImages = loadImages();
    initAIGeneration();
    initTemplateSelectors();
    initOptimizationSwitches();
    
    /**
     * 初始化优化开关
     */
    function initOptimizationSwitches() {
        // 优化文案开关
        const copySwitch = document.querySelector('.bg-white.rounded-xl.p-3.shadow-sm.mb-3:nth-child(2) .relative');
        if (copySwitch) {
            copySwitch.addEventListener('click', function() {
                isCopyOptimized = !isCopyOptimized;
                this.classList.toggle('bg-gray-300');
                this.classList.toggle('bg-green-500');
                const dot = this.querySelector('span');
                if (dot) {
                    dot.classList.toggle('right-1');
                    dot.classList.toggle('left-1');
                }
                showToast(isCopyOptimized ? '已开启文案优化' : '已关闭文案优化', 'info');
            });
        }
        
        // 优化排版开关
        const layoutSwitch = document.querySelector('.bg-white.rounded-xl.p-3.shadow-sm.mb-3:nth-child(3) .relative');
        if (layoutSwitch) {
            layoutSwitch.addEventListener('click', function() {
                isLayoutOptimized = !isLayoutOptimized;
                this.classList.toggle('bg-gray-300');
                this.classList.toggle('bg-green-500');
                const dot = this.querySelector('span');
                if (dot) {
                    dot.classList.toggle('right-1');
                    dot.classList.toggle('left-1');
                }
                showToast(isLayoutOptimized ? '已开启排版优化' : '已关闭排版优化', 'info');
            });
        }
        
        // 热门话题开关
        const topicSwitch = document.querySelector('.bg-white.rounded-xl.p-3.shadow-sm:last-child .relative');
        if (topicSwitch) {
            topicSwitch.addEventListener('click', function() {
                isTopicEnabled = !isTopicEnabled;
                this.classList.toggle('bg-gray-300');
                this.classList.toggle('bg-green-500');
                const dot = this.querySelector('span');
                if (dot) {
                    dot.classList.toggle('right-1');
                    dot.classList.toggle('left-1');
                }
                showToast(isTopicEnabled ? '已开启热门话题' : '已关闭热门话题', 'info');
            });
        }
    }
    
    /**
     * 处理图片加载
     */
    function loadImages() {
        let uploadedImages = [];
        let currentImageIndex = 0;
        
        try {
            // 首先检查是否有从单张图片预览跳转过来的情况
            const currentImage = localStorage.getItem('currentImage');
            
            if (currentImage) {
                // 如果有当前选中的图片，将它放在第一位
                uploadedImages.push(currentImage);
                localStorage.removeItem('currentImage'); // 清除当前图片标记
            }
            
            // 然后加载所有上传过的图片
            const storedImages = localStorage.getItem('uploadedImages');
            if (storedImages) {
                const parsedImages = JSON.parse(storedImages);
                
                // 避免重复添加当前图片
                if (currentImage) {
                    parsedImages.forEach(img => {
                        if (img !== currentImage) {
                            uploadedImages.push(img);
                        }
                    });
                } else {
                    uploadedImages = parsedImages;
                }
                
                // 设置第一张图片
                if (uploadedImages.length > 0 && carouselImage) {
                    carouselImage.src = uploadedImages[0];
                    
                    // 清空指示器
                    if (carouselIndicators) {
                        carouselIndicators.innerHTML = '';
                        
                        // 添加指示器
                        uploadedImages.forEach((_, index) => {
                            const indicator = document.createElement('div');
                            indicator.className = `image-carousel-indicator ${index === 0 ? 'active' : ''}`;
                            indicator.dataset.index = index;
                            
                            // 点击指示器切换图片
                            indicator.addEventListener('click', function() {
                                currentImageIndex = parseInt(this.dataset.index);
                                updateCarousel();
                            });
                            
                            carouselIndicators.appendChild(indicator);
                        });
                    }
                    
                    // 只有多张图片时才显示切换按钮
                    if (prevImageBtn && nextImageBtn) {
                        if (uploadedImages.length <= 1) {
                            prevImageBtn.style.display = 'none';
                            nextImageBtn.style.display = 'none';
                        } else {
                            prevImageBtn.style.display = 'flex';
                            nextImageBtn.style.display = 'flex';
                        }
                    }
                }
            }
        } catch (e) {
            console.error('加载图片失败:', e);
            showToast('加载图片失败，请返回重试', 'error');
        }
        
        // 更新轮播图
        function updateCarousel() {
            if (uploadedImages.length === 0 || !carouselImage) return;
            
            // 更新图片
            carouselImage.src = uploadedImages[currentImageIndex];
            
            // 更新指示器
            if (carouselIndicators) {
                const indicators = carouselIndicators.querySelectorAll('.image-carousel-indicator');
                indicators.forEach((indicator, index) => {
                    if (index === currentImageIndex) {
                        indicator.classList.add('active');
                    } else {
                        indicator.classList.remove('active');
                    }
                });
            }
        }
        
        // 上一张图片
        if (prevImageBtn) {
            prevImageBtn.addEventListener('click', function() {
                if (uploadedImages.length <= 1) return;
                
                currentImageIndex = (currentImageIndex - 1 + uploadedImages.length) % uploadedImages.length;
                updateCarousel();
            });
        }
        
        // 下一张图片
        if (nextImageBtn) {
            nextImageBtn.addEventListener('click', function() {
                if (uploadedImages.length <= 1) return;
                
                currentImageIndex = (currentImageIndex + 1) % uploadedImages.length;
                updateCarousel();
            });
        }
        
        return uploadedImages;
    }
    
    /**
     * AI生成文案功能
     */
    function initAIGeneration() {
        if (!generateCopyBtn) return;
        
        generateCopyBtn.addEventListener('click', function() {
            // 确保有图片可供分析
            if (!carouselImage || !carouselImage.src || carouselImage.src === '') {
                showToast('请先上传图片', 'error');
                return;
            }
            
            // 显示生成中状态
            generateCopyBtn.disabled = true;
            if (aiGeneratingContainer) {
                aiGeneratingContainer.classList.remove('hidden');
            }
            
            // 获取状态文本元素
            const progressStatus = document.querySelector('#aiGeneratingContainer .loading-text');
            
            // 模拟进度条
            let progress = 0;
            let progressInterval;
            
            if (aiProgressBar) {
                progressInterval = setInterval(() => {
                    progress += 2;
                    aiProgressBar.style.width = `${Math.min(progress, 90)}%`;
                    
                    // 更新状态文本
                    if (progressStatus) {
                        if (progress < 30) {
                            progressStatus.innerHTML = '分析图片内容中<span>.</span><span>.</span><span>.</span>';
                        } else if (progress < 60) {
                            progressStatus.innerHTML = '生成营销文案中<span>.</span><span>.</span><span>.</span>';
                        } else if (progress < 90) {
                            progressStatus.innerHTML = '优化内容格式中<span>.</span><span>.</span><span>.</span>';
                        }
                    }
                    
                    if (progress >= 90) {
                        clearInterval(progressInterval);
                    }
                }, 100);
            }
            
            // 调用SiliconFlow API生成文案
            generateCopyWithAI().then(result => {
                // 完成进度条
                if (aiProgressBar) {
                    aiProgressBar.style.width = '100%';
                }
                if (progressStatus) {
                    progressStatus.innerHTML = '生成完成！';
                }
                
                // 等待短暂动画后填充内容
                setTimeout(() => {
                    // 隐藏生成中状态
                    generateCopyBtn.disabled = false;
                    if (aiGeneratingContainer) {
                        aiGeneratingContainer.classList.add('hidden');
                    }
                    
                    // 填充生成的内容
                    if (result) {
                        // 应用生成的文案
                        applyGeneratedContent(result);
                        
                        // 显示成功提示
                        showToast('AI文案生成成功', 'success');
                        
                        // 平滑滚动到内容区域
                        if (previewTitle) {
                            previewTitle.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    } else {
                        showToast('生成文案失败，请重试', 'error');
                    }
                }, 500);
            }).catch(error => {
                console.error('AI生成失败:', error);
                
                // 隐藏生成中状态
                if (progressInterval) {
                    clearInterval(progressInterval);
                }
                if (aiProgressBar) {
                    aiProgressBar.style.width = '0%';
                }
                generateCopyBtn.disabled = false;
                if (aiGeneratingContainer) {
                    aiGeneratingContainer.classList.add('hidden');
                }
                
                // 显示详细错误提示
                let errorMessage = '生成文案失败';
                if (error.message) {
                    if (error.message.includes('API请求失败: 401')) {
                        errorMessage += '：API密钥无效或已过期';
                    } else if (error.message.includes('API请求失败: 429')) {
                        errorMessage += '：超出API调用限制，请稍后再试';
                    } else if (error.message.includes('API请求失败: 5')) {
                        errorMessage += '：服务器错误，请稍后再试';
                    } else {
                        errorMessage += '：' + error.message;
                    }
                }
                
                showToast(errorMessage, 'error');
            });
        });
    }
    
    /**
     * 应用生成的文案内容
     */
    function applyGeneratedContent(result) {
        // 创建一个应用动画效果的函数
        const applyWithAnimation = (element, newText) => {
            if (!element || !newText) return;
            
            // 添加淡出效果
            element.style.transition = 'opacity 0.3s ease';
            element.style.opacity = '0';
            
            // 等待淡出完成后更新内容
            setTimeout(() => {
                element.textContent = newText;
                element.style.opacity = '1';
                
                // 添加高亮效果
                element.style.backgroundColor = '#f0fdf4';
                setTimeout(() => {
                    element.style.backgroundColor = 'transparent';
                    element.style.transition = 'background-color 0.5s ease';
                }, 100);
            }, 300);
        };

        // 应用标题
        if (result.title && previewTitle) {
            applyWithAnimation(previewTitle, result.title);
        }

        // 应用描述
        if (result.description && previewDesc) {
            applyWithAnimation(previewDesc, result.description);
        }
        
        // 应用详细内容
        if (result.sections && result.sections.length > 0 && contentSections) {
            result.sections.forEach((section, index) => {
                if (section.content) {
                    applyWithAnimation(contentSections[index], section.content);
                }
            });
        }
    }
    
    /**
     * 使用SiliconFlow API生成文案
     */
    async function generateCopyWithAI() {
        // 模拟 API 调用延迟
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
            title: "【限时特惠】高山果园红富士苹果，一口咬下去全是甜蜜！",
            description: "🌟 今天给大家带来的是来自高海拔山区的红富士苹果，每一颗都经过精心挑选，保证品质！\n\n🌿 生长环境：\n- 海拔2000米以上，昼夜温差大\n- 采用有机种植，不使用农药\n- 山泉水灌溉，自然生长\n\n🍎 产品特点：\n- 果肉细腻，口感脆甜\n- 汁水丰富，香气怡人\n- 富含维生素和膳食纤维\n\n💝 食用建议：\n- 建议冷藏后食用，口感更佳\n- 可以搭配酸奶或沙拉\n- 适合送礼或自用\n\n🎁 限时特惠：\n- 原价：¥19.8/斤\n- 特惠价：¥15.8/斤\n- 满3斤包邮\n\n⏰ 活动时间：即日起至本周日\n\n#有机水果 #红富士苹果 #健康生活 #限时特惠",
            sections: [
                {
                    title: "产品特点",
                    content: "这款红富士苹果产自高海拔山区，生长环境优越，采用有机种植方式，不使用化学农药和化肥，保证了果实的天然品质。果肉细腻，口感脆甜，每一口都能感受到大自然的馈赠。"
                },
                {
                    title: "口感描述",
                    content: "咬一口，汁水四溢，甜度适中不腻口。果肉细腻，香气怡人，是水果爱好者的不二之选。冷藏后食用，口感更佳，是夏日解暑的绝佳选择。"
                },
                {
                    title: "营养价值",
                    content: "富含多种维生素和膳食纤维，有助于肠道健康，增强免疫力。每天一个苹果，医生远离我！特别适合注重健康生活的现代人。"
                }
            ]
        };
    }
    
    /**
     * 初始化模板选择器
     */
    function initTemplateSelectors() {
        const templateOptions = document.querySelectorAll('.template-option');
        const previewContent = document.querySelector('.preview-content');
        
        templateOptions.forEach(option => {
            option.addEventListener('click', function() {
                // 移除所有模板的选中状态
                templateOptions.forEach(t => t.classList.remove('selected'));
                
                // 添加当前模板的选中状态
                this.classList.add('selected');
                
                // 显示选中模板的提示
                if (this.querySelector('.bg-black')) {
                    const templateName = this.querySelector('.bg-black').textContent;
                    showToast(`已切换到${templateName}`, 'success');
                } else {
                    showToast('已切换模板', 'success');
                }
            });
        });
    }
}); 