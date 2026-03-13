// 遗传算法训练器
class GeneticTrainer {
    constructor(game) {
        this.game = game; // 引用游戏实例
        this.populationSize = 20; // 种群大小
        this.generation = 0;
        this.population = [];
        this.bestWeights = null;
        this.bestFitness = -Infinity;
        
        this.mutationRate = 0.1; // 变异率
        this.mutationStrength = 0.2; // 变异强度
        
        this.isTraining = false;
        this.currentIndividual = 0;
        this.currentGame = 0;
        this.gamesPerIndividual = 3; // 每个个体玩的游戏数
        
        this.loadProgress();
    }
    
    // 初始化种群
    initializePopulation() {
        this.population = [];
        for (let i = 0; i < this.populationSize; i++) {
            this.population.push({
                weights: this.randomWeights(),
                fitness: 0,
                games: 0
            });
        }
    }
    
    // 生成随机权重
    randomWeights() {
        return {
            completeLines: Math.random() * 2,
            aggregateHeight: -Math.random() * 2,
            holes: -Math.random() * 2,
            bumpiness: -Math.random() * 2
        };
    }
    
    // 评估个体（玩多局游戏取平均）
    async evaluateIndividual(individual) {
        let totalScore = 0;
        let totalLines = 0;
        
        for (let i = 0; i < this.gamesPerIndividual; i++) {
            this.currentGame = i + 1;
            this.updateUI();
            
            // 应用当前个体的权重
            this.game.ai.weights = { ...individual.weights };
            
            // 玩一局游戏
            const result = await this.playOneGame();
            totalScore += result.score;
            totalLines += result.lines;
        }
        
        // 适应度 = 平均分数 + 平均行数 * 100
        individual.fitness = (totalScore / this.gamesPerIndividual) + 
                            (totalLines / this.gamesPerIndividual) * 100;
        individual.games = this.gamesPerIndividual;
        
        // 更新最佳权重
        if (individual.fitness > this.bestFitness) {
            this.bestFitness = individual.fitness;
            this.bestWeights = { ...individual.weights };
            this.saveProgress();
        }
    }
    
    // 玩一局游戏
    playOneGame() {
        return new Promise((resolve) => {
            // 重置游戏
            this.game.board.reset();
            this.game.scoreManager.reset();
            this.game.currentPiece = this.game.randomPiece();
            this.game.nextPiece = this.game.randomPiece();
            this.game.holdPiece = null;
            this.game.canHold = true;
            this.game.gameState = 'playing';
            this.game.dropCounter = 0;
            this.game.aiTargetMove = null;
            
            // 监听游戏结束
            const checkGameOver = () => {
                if (this.game.gameState === 'gameover') {
                    const result = {
                        score: this.game.scoreManager.score,
                        lines: this.game.scoreManager.lines
                    };
                    resolve(result);
                } else {
                    requestAnimationFrame(checkGameOver);
                }
            };
            
            checkGameOver();
        });
    }
    
    // 选择（锦标赛选择）
    tournamentSelection() {
        const tournamentSize = 3;
        let best = null;
        
        for (let i = 0; i < tournamentSize; i++) {
            const candidate = this.population[Math.floor(Math.random() * this.population.length)];
            if (!best || candidate.fitness > best.fitness) {
                best = candidate;
            }
        }
        
        return best;
    }
    
    // 交叉（单点交叉）
    crossover(parent1, parent2) {
        const child = { weights: {}, fitness: 0, games: 0 };
        const keys = Object.keys(parent1.weights);
        
        for (let key of keys) {
            // 50% 概率从父母之一继承
            child.weights[key] = Math.random() < 0.5 ? 
                parent1.weights[key] : parent2.weights[key];
        }
        
        return child;
    }
    
    // 变异
    mutate(individual) {
        const keys = Object.keys(individual.weights);
        
        for (let key of keys) {
            if (Math.random() < this.mutationRate) {
                // 添加随机扰动
                const delta = (Math.random() - 0.5) * 2 * this.mutationStrength;
                individual.weights[key] += delta;
            }
        }
    }
    
    // 进化一代
    async evolveGeneration() {
        if (!this.isTraining) return;
        
        console.log(`\n=== 第 ${this.generation} 代 ===`);
        
        // 评估当前种群
        for (let i = 0; i < this.population.length; i++) {
            if (!this.isTraining) break;
            
            this.currentIndividual = i + 1;
            this.currentGame = 0;
            this.updateUI();
            
            await this.evaluateIndividual(this.population[i]);
            console.log(`个体 ${i + 1}/${this.populationSize} - 适应度: ${this.population[i].fitness.toFixed(0)}`);
        }
        
        if (!this.isTraining) return;
        
        // 排序
        this.population.sort((a, b) => b.fitness - a.fitness);
        
        const avgFitness = this.population.reduce((sum, ind) => sum + ind.fitness, 0) / this.population.length;
        
        console.log(`\n最佳适应度: ${this.population[0].fitness.toFixed(0)}`);
        console.log(`平均适应度: ${avgFitness.toFixed(0)}`);
        console.log(`历史最佳: ${this.bestFitness.toFixed(0)}`);
        
        // 生成新种群
        const newPopulation = [];
        
        // 精英保留（保留最好的 2 个）
        newPopulation.push({ 
            weights: { ...this.population[0].weights }, 
            fitness: 0, 
            games: 0 
        });
        newPopulation.push({ 
            weights: { ...this.population[1].weights }, 
            fitness: 0, 
            games: 0 
        });
        
        // 生成剩余个体
        while (newPopulation.length < this.populationSize) {
            const parent1 = this.tournamentSelection();
            const parent2 = this.tournamentSelection();
            const child = this.crossover(parent1, parent2);
            this.mutate(child);
            newPopulation.push(child);
        }
        
        this.population = newPopulation;
        this.generation++;
        this.saveProgress();
        this.updateUI();
    }
    
    // 开始训练
    async startTraining(generations = 10) {
        this.isTraining = true;
        
        if (this.population.length === 0) {
            this.initializePopulation();
        }
        
        for (let i = 0; i < generations; i++) {
            if (!this.isTraining) break;
            await this.evolveGeneration();
        }
        
        this.isTraining = false;
        
        // 应用最佳权重
        if (this.bestWeights) {
            this.game.ai.weights = { ...this.bestWeights };
        }
        
        alert(`训练完成！\n代数: ${this.generation}\n最佳适应度: ${this.bestFitness.toFixed(0)}`);
    }
    
    // 停止训练
    stopTraining() {
        this.isTraining = false;
    }
    
    // 更新 UI
    updateUI() {
        document.getElementById('evolutionGen').textContent = this.generation;
        document.getElementById('evolutionInd').textContent = 
            `${this.currentIndividual}/${this.populationSize} (${this.currentGame}/${this.gamesPerIndividual})`;
        document.getElementById('evolutionBest').textContent = 
            this.bestFitness > -Infinity ? this.bestFitness.toFixed(0) : '0';
        
        if (this.population.length > 0) {
            const evaluated = this.population.filter(ind => ind.fitness > 0);
            if (evaluated.length > 0) {
                const avgFitness = evaluated.reduce((sum, ind) => sum + ind.fitness, 0) / evaluated.length;
                document.getElementById('evolutionAvg').textContent = avgFitness.toFixed(0);
            }
        }
        
        if (this.bestWeights) {
            document.getElementById('weightLines').textContent = this.bestWeights.completeLines.toFixed(2);
            document.getElementById('weightHeight').textContent = this.bestWeights.aggregateHeight.toFixed(2);
            document.getElementById('weightHoles').textContent = this.bestWeights.holes.toFixed(2);
            document.getElementById('weightBump').textContent = this.bestWeights.bumpiness.toFixed(2);
        }
    }
    
    // 保存训练进度
    saveProgress() {
        const progress = {
            generation: this.generation,
            bestWeights: this.bestWeights,
            bestFitness: this.bestFitness,
            population: this.population
        };
        localStorage.setItem('tetris_genetic_progress', JSON.stringify(progress));
    }
    
    // 加载训练进度
    loadProgress() {
        const saved = localStorage.getItem('tetris_genetic_progress');
        if (saved) {
            const progress = JSON.parse(saved);
            this.generation = progress.generation || 0;
            this.bestWeights = progress.bestWeights;
            this.bestFitness = progress.bestFitness || -Infinity;
            this.population = progress.population || [];
        }
    }
    
    // 重置训练
    reset() {
        this.generation = 0;
        this.bestWeights = null;
        this.bestFitness = -Infinity;
        this.initializePopulation();
        this.saveProgress();
    }
    
    // 获取当前最佳权重
    getBestWeights() {
        return this.bestWeights || {
            completeLines: 0.76,
            aggregateHeight: -0.51,
            holes: -0.35,
            bumpiness: -0.18
        };
    }
}
