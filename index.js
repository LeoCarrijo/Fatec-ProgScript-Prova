const { createApp } = Vue;

createApp({
    data() {
        return {
            round: 1,
            gameover: false,
            endingMsg: '',
            endingTitle: '',
            heroAttacking: false,
            hero: {
                role: 'hero',
                life: 100,
                maxLife: 100,
                rage: 0,
                maxRage: 100,
                berserkMode: false,
                berserkDmgMult: 3,
                minBerkserkDmg: 3,
                name: 'Guts',
                maxDmg: 20,
                defended: false,
                defenseArmor: 0,
                elfPowder: 3,
                log: '',
                logAux: ''
            },
            villan: {
                role: 'villan',
                life: 200,
                maxLife: 200,
                femto: false,
                femtoDmgMult: 6,
                name: 'Griffith',
                maxDmg: 15,
                defended: false,
                defenseArmor: 0,
                elfPowder: 3,
                log: '',
                logAux: ''
            }
        }
    },
    methods: {
        handlerClick(opt) {
            this.resetLogs()
            switch(opt) {
                case 'attack':
                    this.attack(true)
                    break
                case 'defend':
                    this.defend(true)
                    break
                case 'stopDefending':
                    this.stopDefending(true)
                    break
                case 'use':
                    this.use(true)
                    break
                case 'flee':
                    this.flee()
                    break
                case 'stand':
                    this.stand(true)
                    break
            }
            if(!this.gameover) {
                this.passRound()
            }
        },
        attack(isHero) {
            let character = isHero ? this.hero : this.villan
            let foe = !isHero ? this.hero : this.villan
            let dmg = this.generateRng(character.maxDmg)
            if(isHero) {
                this.changeToAttackSprite(true)
            } else {
                this.changeToAttackSprite(false)
            }
            if(isHero && this.hero.berserkMode) {
                dmg = dmg < this.hero.minBerkserkDmg ? this.hero.minBerkserkDmg : dmg
                dmg *= this.hero.berserkDmgMult
            }
            if(!isHero && this.villan.femto) {
                dmg *= this.villan.femtoDmgMult
            }
            this.causeDamage(dmg, isHero)
            console.log(`${dmg} de dano causado`)
            this.changeLog(isHero, `${dmg} de dano causado`)
            console.log(`Vida de ${foe.name}: ${foe.life}`)
            this.changeLog(isHero, `Vida de ${foe.name}: ${foe.life}`, true)
            this.fixSizeOf(`${foe.role}-life-bar`)
        },
        defend(isHero) {
            let character = isHero ? this.hero : this.villan
            character.defend = true
            character.defenseArmor = 2
            this.changeLog(isHero, `${character.name} está defendendo!`)
        },
        stopDefending(isHero) {
            let character = isHero ? this.hero : this.villan
            character.defend = false
            character.defenseArmor = 0
            this.changeLog(isHero, `${character.name} parou de defender!`)
        },
        use(isHero) {
            let character = isHero ? this.hero : this.villan
            if(character.elfPowder > 0) {
                this.heal(isHero)
            } else {
                this.changeLog(isHero, `${character.name} não possui mais pó élfico!`)
            }
        },
        flee() {
            if(this.generateRng(11) > 8) {
                this.changeLog(true, `${this.hero.name} Fugiu!`)
                this.endGame(false)
            } else {
                this.changeLog(true, `${this.hero.name} tentou fugir mas não conseguiu...`)
                this.causeDamage(Math.floor(this.villan.maxDmg * 1.5), false)
                this.fixSizeOf(`${this.hero.role}-life-bar`)
            }
        },
        stand(isHero) {
            let character = isHero ? this.hero : this.villan
            this.changeLog(isHero, `${character.name} manteve posição`)
        },
        generateRng(max) {
            let value = (Math.floor(Math.random() * max))
            if(value == 0) {
                return 1
            } else {
                return value
            }
        },
        causeDamage(dmg, isHero) {
            let foe = !isHero ? this.hero : this.villan
            if(!foe.defend) {
                foe.life -= dmg
                if(!isHero && !this.hero.berserkMode) {
                    this.increaseRage(dmg)
                }
                if(foe.life < 0) {
                    foe.life = 0
                }
            } else {
                foe.defenseArmor -= 1
                this.changeLog(!isHero, `${foe.defenseArmor} de armadura restante`)
                if(foe.defenseArmor == 0) {
                    foe.defend = false
                }
            }
        },
        increaseRage(rageAmmount) {
            this.hero.rage += (this.hero.rage + rageAmmount > this.hero.maxRage) ? (this.hero.maxRage - this.hero.rage) : rageAmmount
            if(this.hero.rage == this.hero.maxRage) {
                this.turnIntoBerserk()
            }
            this.fixSizeOf(`${this.hero.role}-rage-bar`, true)
        },
        decreaseRage(rageAmmount) {
            this.hero.rage -= rageAmmount
            this.fixSizeOf(`${this.hero.role}-rage-bar`, true)
            if(this.hero.rage < 0) {
                this.hero.berserkMode = false
            }
        },
        giveElfPowder(toHero) {
            if(toHero) {
                if(this.hero.elfPowder < 5) {
                    this.hero.elfPowder++
                } 
            } else {
                if(this.villan.elfPowder < 5) {
                    this.villan.elfPowder++
                } 
            }
        },
        turnIntoBerserk() {
            this.hero.berserkMode = true
            let healAmmount = this.hero.maxLife / 2
            this.hero.life += (this.hero.life + healAmmount > this.hero.maxLife) ? (this.hero.maxLife - this.hero.life) : healAmmount 
            this.changeLog(true, `${this.hero.name} está enfurecido!`)
            this.fixSizeOf(`${this.hero.role}-life-bar`)
        },
        turnIntoFemto() {
            this.villan.name = 'Femto'
            this.villan.femto = true
            this.villan.maxLife = 1000
            this.villan.life = this.villan.maxLife
            this.fixSizeOf(`${this.villan.role}-life-bar`)
            document.getElementById('sprite-griffith').id = 'sprite-femto'
        },
        heal(isHero) {
            let character = isHero ? this.hero : this.villan
            let healAmmount = 30
            character.life += (character.life + healAmmount > character.maxLife) ? (character.maxLife - character.life) : healAmmount 
            character.elfPowder--
            this.changeLog(isHero, `${character.name} curado em ${healAmmount} de HP!`)
            this.fixSizeOf(`${character.role}-life-bar`)
        },
        fixSizeOf(element, rage = false) {
            if(!rage) {
                let character = element.indexOf(this.hero.role) == -1 ? this.villan : this.hero
                document.getElementById(element).style.width = (`${character.life * 100 / character.maxLife}%`)
            } else {
                document.getElementById(element).style.width = (`${this.hero.rage * 100 / this.hero.maxRage}%`)
            }
        },
        changeToAttackSprite(isHero) {
            let path = 'styles/static/img/sprites/'
            let character = isHero ? this.hero.name : this.villan.name
            let element = document.getElementById(`sprite-${character.toLowerCase()}`)
            element.style.backgroundImage = `url('${path}${character.toLowerCase()}-ataque-128x3.gif?${Math.random()}')`
            setTimeout(() => {
                this.setIdleSprite(isHero)
            }, 1000)
        },
        setIdleSprite(isHero) {
            let path = 'styles/static/img/sprites/'
            let character = isHero ? this.hero.name : this.villan.name
            let element = document.getElementById(`sprite-${character.toLowerCase()}`)
            element.style.backgroundImage = `url('${path}${character.toLowerCase()}-idle-128x3.png?${Math.random()}')`
        },
        endGame(isHero) {
            isHero ? this.victory() : this.defeat()
        },
        defeat() {
            this.endingTitle = `Derrota`
            this.endingMsg = `${this.hero.name} Perdeu...${this.villan.name} Venceu...`
            this.gameover = true
        },
        victory() {
            this.endingTitle = `Vitória`
            this.endingMsg = `${this.villan.name} Perdeu! ${this.hero.name} Venceu!`
            this.gameover = true
        },
        passRound() {
            this.round++
            this.villanAct()
            if(this.villan.life == 0) {
                if(!this.villan.femto) {
                    this.turnIntoFemto()
                } else {
                    this.endGame(true)
                }
            }
            if(this.hero.life == 0) {
                this.endGame(false)
            }
            if(this.round % 10 == 0) {
                this.giveElfPowder(true)
                this.giveElfPowder(false)
            }
            if(this.hero.life != this.hero.maxLife) {
                document.getElementById('use-button').disabled = false
            } else {
                document.getElementById('use-button').disabled = true
            }
            if(!this.hero.defend) {
                document.getElementById('attack-button').disabled = false
            } else {
                document.getElementById('attack-button').disabled = true
            }
            if(this.hero.berserkMode) {
                this.decreaseRage(10)
            }
        },
        villanAct() {
            let actions = ['attack', 'defend', 'use', 'stand']
            if(this.villan.life == this.villan.maxLife || this.villan.elfPowder == 0) {
                actions.splice(actions.indexOf('use'), 1)
            }
            if(this.villan.defend) {
                actions.splice(actions.indexOf('defend'), 1)
                actions.splice(actions.indexOf('attack'), 1)
                actions.push('stopDefending')
            }
            const randomAction = actions[Math.floor(Math.random() * actions.length)]
            this[randomAction](false)
        },
        changeLog(isHero, msg, aux = false) {
            let character = isHero ? this.hero : this.villan
            if(!aux) {
                character.log = msg
            } else {
                character.logAux = msg
            }
        },
        resetLogs() {
            this.hero.log = ''
            this.hero.logAux = ''
            this.villan.log = ''
            this.villan.logAux = ''
        },
        reset() {
            window.location.reload(true)
        }
    }
}).mount('#app')