let balance = 1000;
const minBet = 1;
const balanceEl = document.getElementById('balance');
function updateBalance(amount){ 
    balance += amount; 
    balanceEl.textContent = balance; 
}

function rouletteGame(container){
    container.innerHTML = `
    <div id="roulette-board">
        <div id="roulette-wrapper">
            <canvas id="roulette-wheel" width="400" height="400"></canvas>
            <div id="roulette-indicator"></div>
        </div>
        <div id="roulette-controls">
            <label>Type de pari
                <select id="roulette-type">
                    <option value="number">Numéro</option>
                    <option value="pair">Pair</option>
                    <option value="impair">Impair</option>
                    <option value="rouge">Rouge</option>
                    <option value="noir">Noir</option>
                </select>
            </label>
            <label id="number-label">Numéro (0-36)
                <input type="number" id="roulette-number" min="0" max="36" value="0">
            </label>
            <label>Mise (€)
                <input type="number" id="roulette-bet" min="1" value="10">
            </label>
            <button class="play-btn" id="roulette-spin">SPIN</button>
        </div>
        <p id="roulette-result"></p>
        <div id="roulette-history"><strong>Derniers tirages :</strong> <span id="history-list"></span></div>
    </div>`;

    const canvas = document.getElementById('roulette-wheel');
    const ctx = canvas.getContext('2d');
    const numbers = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,
                    16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
    const redNumbers = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];

    const typeSelect = document.getElementById('roulette-type');
    const numberLabel = document.getElementById('number-label');
    const spinBtn = document.getElementById('roulette-spin');
    const resultEl = document.getElementById('roulette-result');
    const historyList = document.getElementById('history-list');
    let history=[];

    typeSelect.addEventListener('change',()=>{
        numberLabel.style.display = typeSelect.value==='number'?'block':'none';
    });

    const cx = 200, cy = 200, radius = 180;
    const anglePerNumber = 2*Math.PI/numbers.length;

    function drawWheel(rotation=0){
        ctx.clearRect(0,0,400,400);
        ctx.save();
        ctx.translate(cx,cy);
        ctx.rotate(rotation);
        ctx.translate(-cx,-cy);
        numbers.forEach((num,i)=>{
            const start = i*anglePerNumber;
            const end = start+anglePerNumber;
            ctx.beginPath();
            ctx.moveTo(cx,cy);
            ctx.arc(cx,cy,radius,start,end);
            ctx.fillStyle = num===0?'green':redNumbers.includes(num)?'red':'black';
            ctx.fill(); ctx.strokeStyle='#fff'; ctx.stroke();
            ctx.save();
            ctx.translate(cx,cy);
            ctx.rotate(start+anglePerNumber/2);
            ctx.textAlign='right';
            ctx.fillStyle='#fff';
            ctx.font='14px Arial';
            ctx.fillText(num,radius-10,5);
            ctx.restore();
        });
        ctx.restore();
    }
    drawWheel();

    spinBtn.addEventListener('click',()=>{
        const bet = parseInt(document.getElementById('roulette-bet').value);
        const type = typeSelect.value;
        const chosenNumber = parseInt(document.getElementById('roulette-number')?.value);

        if(bet>balance){alert('Solde insuffisant'); return;}
        if(bet<minBet){alert('Mise minimale 1€'); return;}

        const winningIndex = Math.floor(Math.random()*numbers.length);
        const winningNumber = numbers[winningIndex];
        const targetRotation = -(winningIndex*anglePerNumber) - anglePerNumber/2 + Math.PI/2;
        const spins = 5;
        const totalRotation = spins*2*Math.PI + targetRotation;
        const duration = 4000;
        let start=null;

        function animate(timestamp){
            if(!start) start=timestamp;
            const progress = (timestamp-start)/duration;
            const ease = 1-Math.pow(1-progress,3);
            drawWheel(totalRotation*ease);
            if(progress<1) requestAnimationFrame(animate);
            else finalize();
        }
        requestAnimationFrame(animate);

        function finalize(){
            history.unshift(winningNumber);
            if(history.length>10) history.pop();
            historyList.textContent=history.join(', ');

            let won=false, multiplier=0;
            switch(type){
                case 'number': if(chosenNumber===winningNumber){won=true; multiplier=35;} break;
                case 'pair': if(winningNumber!==0 && winningNumber%2===0){won=true; multiplier=2;} break;
                case 'impair': if(winningNumber%2===1){won=true; multiplier=2;} break;
                case 'rouge': if(redNumbers.includes(winningNumber)){won=true; multiplier=2;} break;
                case 'noir': if(winningNumber!==0 && !redNumbers.includes(winningNumber)){won=true; multiplier=2;} break;
            }
            if(won){
                updateBalance(bet*multiplier);
                resultEl.textContent = `🎉 Gagné ! Numéro ${winningNumber} → +${bet*multiplier} €`;
                resultEl.className='win';
            } else {
                updateBalance(-bet);
                resultEl.textContent = `❌ Perdu ! Numéro ${winningNumber} → -${bet} €`;
                resultEl.className='lose';
            }
        }
    });
}

function slotsGame(container){
    const symbols = ['🍒','🍋','🍊','🍉','⭐','7️⃣'];
    container.innerHTML = `
        <h2>Machine à sous</h2>
        <label>Mise (€)
            <input type="number" id="slots-bet" min="${minBet}" value="10">
        </label>
        <button class="play-btn" id="slots-spin">SPIN</button>
        <div id="slots-reels">
            <span id="reel1">🍒</span>
            <span id="reel2">🍋</span>
            <span id="reel3">🍊</span>
        </div>
        <p id="slots-result"></p>
    `;
    const reelEls = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
    const spinBtn = document.getElementById('slots-spin');
    const resultEl = document.getElementById('slots-result');

    spinBtn.addEventListener('click',()=>{
        const bet = parseInt(document.getElementById('slots-bet').value);
        if(bet>balance){alert('Solde insuffisant');return;}
        if(bet<minBet){alert('Mise minimale 1€');return;}

        spinBtn.disabled = true;
        resultEl.textContent = 'Spinning... 🎰';
        resultEl.className='';

        const spins = 20; 
        let current = 0;

        const interval = setInterval(()=>{
            reelEls.forEach(el=>{
                el.style.transform='translateY(-10px)';
                const sym = symbols[Math.floor(Math.random()*symbols.length)];
                el.textContent = sym;
            });
            setTimeout(()=>reelEls.forEach(el=>el.style.transform='translateY(0)'),100);
            current++;
            if(current>=spins){
                clearInterval(interval);
                const finalReels = [
                    symbols[Math.floor(Math.random()*symbols.length)],
                    symbols[Math.floor(Math.random()*symbols.length)],
                    symbols[Math.floor(Math.random()*symbols.length)]
                ];
                reelEls.forEach((el,i)=>el.textContent=finalReels[i]);
                let win = 0;
                if(finalReels[0]===finalReels[1] && finalReels[1]===finalReels[2]){
                    win = bet*10;
                } else if(finalReels[0]===finalReels[1] || finalReels[1]===finalReels[2] || finalReels[0]===finalReels[2]){
                    win = bet*2;
                }

                if(win>0){
                    updateBalance(win);
                    resultEl.textContent = `🎉 Gagné ! ${finalReels.join(' ')} → +${win} €`;
                    resultEl.className='win';
                } else {
                    updateBalance(-bet);
                    resultEl.textContent = `❌ Perdu ! ${finalReels.join(' ')} → -${bet} €`;
                    resultEl.className='lose';
                }
                spinBtn.disabled = false;
            }
        },100);
    });
}

function blackjackGame(container){
    container.innerHTML = `
    <h2>Blackjack</h2>
    <label>Mise (€)
        <input type="number" id="blackjack-bet" min="${minBet}" value="10">
    </label>
    <button class="play-btn" id="blackjack-deal">Distribuer</button>
    <div id="blackjack-table" style="display:flex;justify-content:center;gap:50px;margin-top:1rem;">
        <div id="player-hand" class="hand">
            <h3>Votre main (<span id="player-score">0</span>)</h3>
            <div class="cards" style="display:flex;gap:10px;"></div>
        </div>
        <div id="dealer-hand" class="hand">
            <h3>Dealer (<span id="dealer-score">0</span>)</h3>
            <div class="cards" style="display:flex;gap:10px;"></div>
        </div>
    </div>
    <div id="blackjack-controls" style="margin-top:10px; display:none; gap:10px;">
        <button class="play-btn" id="hit-btn">Tirer</button>
        <button class="play-btn" id="stand-btn">Stand</button>
    </div>
    <p id="blackjack-result" style="text-align:center; min-height:2em; font-size:1.5rem; font-weight:bold;"></p>
    `;

    const suits = ['♠','♥','♦','♣'];
    const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    let deck = [], playerCards = [], dealerCards = [], bet=0;

    const playerHandEl = document.querySelector('#player-hand .cards');
    const dealerHandEl = document.querySelector('#dealer-hand .cards');
    const playerScoreEl = document.getElementById('player-score');
    const dealerScoreEl = document.getElementById('dealer-score');
    const resultEl = document.getElementById('blackjack-result');
    const controlsEl = document.getElementById('blackjack-controls');

    const dealBtn = document.getElementById('blackjack-deal');
    const hitBtn = document.getElementById('hit-btn');
    const standBtn = document.getElementById('stand-btn');

    function createDeck(){
        deck=[];
        suits.forEach(s=>ranks.forEach(r=>deck.push({suit:s, rank:r})));
        deck = deck.sort(()=>Math.random()-0.5);
    }

    function calculateScore(hand){
        let score=0, aces=0;
        hand.forEach(card=>{
            if(card.rank==='A'){score+=11; aces++;}
            else if(['J','Q','K'].includes(card.rank)){score+=10;}
            else score+=parseInt(card.rank);
        });
        while(score>21 && aces>0){score-=10; aces--;}
        return score;
    }

    function getCardImageURL(card){
        const suitMap = {'♠':'s','♥':'h','♦':'d','♣':'c'};
        let rank = card.rank;
        if(['J','Q','K','A'].includes(rank)){
            rank = rank.toUpperCase();
        } else {
            rank = rank.toLowerCase();
        }
        return `https://www.hegerm.ch/images/cartes/${rank}${suitMap[card.suit]}.gif`;
    }


    function renderCardImage(card){
        const img = document.createElement('img');
        img.src = getCardImageURL(card);
        img.style.width='60px';
        img.style.height='90px';
        img.style.borderRadius='5px';
        img.style.border='1px solid #fff';
        img.style.margin='0 5px';
        img.style.transform='translateY(-30px)';
        img.style.opacity='0';
        return img;
    }

    function addCardWithAnimationImage(handEl, card){
        const img = renderCardImage(card);
        handEl.appendChild(img);
        setTimeout(()=>{
            img.style.transition='all 0.4s ease';
            img.style.transform='translateY(0)';
            img.style.opacity='1';
        },50);
    }

    function resetGame(){
        createDeck();
        playerCards=[]; dealerCards=[];
        playerHandEl.innerHTML=''; dealerHandEl.innerHTML='';
        playerScoreEl.textContent='0'; dealerScoreEl.textContent='0';
        resultEl.textContent=''; resultEl.className='';
        controlsEl.style.display='none';
        dealBtn.disabled=false;
    }

    function showResult(text, type){
        resultEl.textContent=text;
        resultEl.className='';
        if(type==='win') resultEl.classList.add('win');
        else if(type==='lose') resultEl.classList.add('lose');
        else if(type==='tie') resultEl.classList.add('tie');
    }

    function endGame(){
        const playerScore = calculateScore(playerCards);
        const dealerScore = calculateScore(dealerCards);
        let winType='tie';
        let amount=0;

        if(playerScore>21){winType='lose'; amount=-bet;}
        else if(dealerScore>21){winType='win'; amount=bet*2;}
        else if(playerScore>dealerScore){winType='win'; amount=bet*2;}
        else if(playerScore<dealerScore){winType='lose'; amount=-bet;}

        if(winType==='win' || winType==='lose'){updateBalance(amount);}
        showResult(
            winType==='win'?`🎉 Vous gagnez ! +${amount} €`:
            winType==='lose'?`❌ Vous perdez ! -${bet} €`:
            `🤝 Égalité !`,
            winType
        );

        controlsEl.style.display='none';
        dealBtn.disabled=false;
    }

    dealBtn.addEventListener('click',()=>{
        bet=parseInt(document.getElementById('blackjack-bet').value);
        if(bet>balance){alert('Solde insuffisant'); return;}
        if(bet<minBet){alert('Mise minimale 1€'); return;}

        resetGame();

        playerCards.push(deck.pop());
        dealerCards.push(deck.pop());
        playerCards.push(deck.pop());
        dealerCards.push(deck.pop());

        renderHandAnimated = (handEl, hand)=>{
            handEl.innerHTML='';
            hand.forEach(card=>addCardWithAnimationImage(handEl,card));
        };

        renderHandAnimated(playerHandEl, playerCards);
        renderHandAnimated(dealerHandEl, [dealerCards[0]]); 
        playerScoreEl.textContent=calculateScore(playerCards);
        dealerScoreEl.textContent='?';

        controlsEl.style.display='flex';
        dealBtn.disabled=true;

        if(calculateScore(playerCards)===21){
            renderHandAnimated(dealerHandEl, dealerCards);
            dealerScoreEl.textContent=calculateScore(dealerCards);
            endGame();
        }
    });

    hitBtn.addEventListener('click',()=>{
        const card = deck.pop();
        playerCards.push(card);
        addCardWithAnimationImage(playerHandEl, card);
        const score = calculateScore(playerCards);
        playerScoreEl.textContent=score;
        if(score>21){
            renderHandAnimated(dealerHandEl, dealerCards);
            dealerScoreEl.textContent=calculateScore(dealerCards);
            endGame();
        }
    });

    standBtn.addEventListener('click',()=>{
        dealerScoreEl.textContent='';
        while(calculateScore(dealerCards)<17){
            dealerCards.push(deck.pop());
        }
        renderHandAnimated(dealerHandEl, dealerCards);
        dealerScoreEl.textContent=calculateScore(dealerCards);
        endGame();
    });

    resetGame();
}

const gameContainer = document.getElementById('game-container');
document.querySelectorAll('.game-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
        const game = btn.dataset.game;
        if(game==='roulette') rouletteGame(gameContainer);
        else if(game==='slots') slotsGame(gameContainer);
        else if(game==='blackjack') blackjackGame(gameContainer);
    });
});
