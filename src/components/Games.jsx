import React, { useState, useEffect } from 'react';
import { useCurrency } from '../contexts/CurrencyContext';
import './Games.css';

function Games() {
  const [activeSection, setActiveSection] = useState('challenges');
  const [triviaScore, setTriviaScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const { updateCurrency } = useCurrency();

  // Daily Challenge Generator
  const challenges = [
    {
      type: 'survival',
      title: 'Apex Endurance',
      description: 'Survive 2 hours as a Tyrannosaurus without dying',
      reward: { amount: 500, currency: 'Razor Talons' },
      difficulty: 'Extreme',
      timeLimit: '24 hours'
    },
    {
      type: 'hunt',
      title: 'Large Carnivore Hunter',
      description: 'Kill a large herbivore (Triceratops or Stegosaurus) as Allosaurus',
      reward: { amount: 300, currency: 'Razor Talons' },
      difficulty: 'Hard',
      timeLimit: '12 hours'
    },
    {
      type: 'hunt',
      title: 'Medium Prey Challenge',
      description: 'Successfully hunt 3 medium herbivores (Maiasaura, Tenontosaurus) as Carnotaurus',
      reward: { amount: 250, currency: 'Razor Talons' },
      difficulty: 'Medium',
      timeLimit: '8 hours'
    },
    {
      type: 'peaceful',
      title: 'Herbivore Survivor',
      description: 'Reach adult size as Triceratops without killing any players',
      reward: { amount: 400, currency: 'Sylvan Shards' },
      difficulty: 'Hard',
      timeLimit: '18 hours'
    },
    {
      type: 'hunt',
      title: 'Pack Leader',
      description: 'Lead a successful pack hunt as Dilophosaurus (3+ pack members)',
      reward: { amount: 200, currency: 'Razor Talons' },
      difficulty: 'Medium',
      timeLimit: '6 hours'
    },
    {
      type: 'survival',
      title: 'Small Survivor',
      description: 'Survive 1 hour as Hypsilophodon without being killed',
      reward: { amount: 300, currency: 'Sylvan Shards' },
      difficulty: 'Hard',
      timeLimit: '4 hours'
    },
    {
      type: 'hunt',
      title: 'Apex Predator',
      description: 'Kill 2 carnivores as Tyrannosaurus in one life',
      reward: { amount: 600, currency: 'Razor Talons' },
      difficulty: 'Extreme',
      timeLimit: '24 hours'
    }
  ];

  const triviaQuestions = [
    {
      question: "Which dinosaur is the apex predator in The Isle: Evrima?",
      options: ["Allosaurus", "Tyrannosaurus", "Carnotaurus", "Ceratosaurus"],
      correct: 1,
      explanation: "Tyrannosaurus is the ultimate apex predator with devastating bite force!"
    },
    {
      question: "Which herbivore is known for its powerful tail swing attack?",
      options: ["Triceratops", "Stegosaurus", "Maiasaura", "Gallimimus"],
      correct: 1,
      explanation: "Stegosaurus has a powerful tail swing that can devastate attackers!"
    },
    {
      question: "Which currency do carnivores use in Ashveil?",
      options: ["Void Pearls", "Razor Talons", "Sylvan Shards", "Crystal Fragments"],
      correct: 1,
      explanation: "Razor Talons are the carnivore currency earned through hunting!"
    },
    {
      question: "Which small carnivore is known for its venomous bite?",
      options: ["Herrerasaurus", "Omniraptor", "Troodon", "Dilophosaurus"],
      correct: 2,
      explanation: "Troodon has a venomous bite that makes it deadly in packs!"
    },
    {
      question: "Which dinosaur is the fastest runner in the game?",
      options: ["Carnotaurus", "Gallimimus", "Dryosaurus", "Hypsilophodon"],
      correct: 1,
      explanation: "Gallimimus is extremely fast and used primarily for escaping!"
    },
    {
      question: "Which currency do herbivores use in Ashveil?",
      options: ["Razor Talons", "Void Pearls", "Sylvan Shards", "Plant Tokens"],
      correct: 2,
      explanation: "Sylvan Shards are the herbivore currency earned through peaceful gameplay!"
    }
  ];

  const communityEvents = [
    {
      id: 1,
      title: "🌙 Moonlight Hunt",
      description: "Night-time hunting competition for carnivores",
      startTime: "Saturday 9:00 PM UTC",
      duration: "3 hours",
      rewards: "1000 Razor Talons + Exclusive Title",
      participants: 23,
      status: "upcoming"
    },
    {
      id: 2,
      title: "🦕 Great Migration",
      description: "Server-wide herbivore migration event",
      startTime: "Sunday 3:00 PM UTC",
      duration: "2 hours",
      rewards: "800 Sylvan Shards + Migration Badge",
      participants: 45,
      status: "upcoming"
    },
    {
      id: 3,
      title: "👑 King of the Hill",
      description: "Territory control battle at Great Falls",
      startTime: "Friday 8:00 PM UTC",
      duration: "1 hour",
      rewards: "1500 Void Pearls + Crown Title",
      participants: 67,
      status: "active"
    },
    {
      id: 4,
      title: "📸 Screenshot Safari",
      description: "Best dinosaur photography contest",
      startTime: "All week",
      duration: "7 days",
      rewards: "500 Void Pearls + Artist Badge",
      participants: 89,
      status: "active"
    }
  ];

  const achievements = [
    {
      category: "Combat",
      items: [
        { name: "First Blood", description: "Get your first player kill", progress: 1, total: 1, completed: true },
        { name: "Apex Predator", description: "Kill 50 players as carnivore", progress: 23, total: 50, completed: false },
        { name: "Pack Leader", description: "Lead successful pack hunts", progress: 8, total: 15, completed: false }
      ]
    },
    {
      category: "Survival",
      items: [
        { name: "Ancient One", description: "Survive 10 hours in one life", progress: 7, total: 10, completed: false },
        { name: "Growth Master", description: "Reach adult on 5 different species", progress: 3, total: 5, completed: false },
        { name: "Mutation Collector", description: "Unlock 20 different mutations", progress: 12, total: 20, completed: false }
      ]
    },
    {
      category: "Social",
      items: [
        { name: "Herd Guardian", description: "Protect juveniles as adult herbivore", progress: 5, total: 10, completed: false },
        { name: "Community Helper", description: "Help 25 new players", progress: 18, total: 25, completed: false },
        { name: "Event Participant", description: "Join 10 community events", progress: 6, total: 10, completed: false }
      ]
    }
  ];

  // Generate daily challenge on component mount
  useEffect(() => {
    const today = new Date().toDateString();
    const savedChallenge = localStorage.getItem('dailyChallenge');
    const savedDate = localStorage.getItem('challengeDate');
    
    if (savedDate !== today) {
      const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
      setDailyChallenge(randomChallenge);
      localStorage.setItem('dailyChallenge', JSON.stringify(randomChallenge));
      localStorage.setItem('challengeDate', today);
    } else if (savedChallenge) {
      setDailyChallenge(JSON.parse(savedChallenge));
    }
  }, []);

  const handleTriviaAnswer = (answer) => {
    setSelectedAnswer(answer);
    setShowResult(true);
    
    if (answer === triviaQuestions[currentQuestion].correct) {
      setTriviaScore(prev => prev + 1);
      // Award currency for correct answers
      updateCurrency('Void Pearls', 10);
    }
    
    setTimeout(() => {
      if (currentQuestion < triviaQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer('');
        setShowResult(false);
      }
    }, 2000);
  };

  const resetTrivia = () => {
    setCurrentQuestion(0);
    setTriviaScore(0);
    setSelectedAnswer('');
    setShowResult(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return '#32CD32';
      case 'Medium': return '#FFD700';
      case 'Hard': return '#FF4500';
      case 'Extreme': return '#DC143C';
      default: return '#ccc';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return '#32CD32';
      case 'upcoming': return '#FFD700';
      case 'completed': return '#ccc';
      default: return '#ccc';
    }
  };

  return (
    <div className="games-page">
      <div className="games-header">
        <h1>🎮 Ashveil Games & Challenges</h1>
        <p>Test your skills, earn rewards, and compete with the community!</p>
      </div>

      <div className="games-nav">
        <button 
          className={`nav-btn ${activeSection === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveSection('challenges')}
        >
          🎯 Daily Challenges
        </button>
        <button 
          className={`nav-btn ${activeSection === 'trivia' ? 'active' : ''}`}
          onClick={() => setActiveSection('trivia')}
        >
          🧠 Dino Trivia
        </button>
        <button 
          className={`nav-btn ${activeSection === 'events' ? 'active' : ''}`}
          onClick={() => setActiveSection('events')}
        >
          🎉 Community Events
        </button>
        <button 
          className={`nav-btn ${activeSection === 'achievements' ? 'active' : ''}`}
          onClick={() => setActiveSection('achievements')}
        >
          🏆 Achievements
        </button>
      </div>

      <div className="games-content">
        {activeSection === 'challenges' && (
          <div className="challenges-section">
            <h2>🎯 Daily Challenge</h2>
            {dailyChallenge && (
              <div className="daily-challenge-card">
                <div className="challenge-header">
                  <h3>{dailyChallenge.title}</h3>
                  <div className="challenge-meta">
                    <span 
                      className="difficulty-badge"
                      style={{ backgroundColor: getDifficultyColor(dailyChallenge.difficulty) }}
                    >
                      {dailyChallenge.difficulty}
                    </span>
                    <span className="time-limit">⏰ {dailyChallenge.timeLimit}</span>
                  </div>
                </div>
                
                <p className="challenge-description">{dailyChallenge.description}</p>
                
                <div className="challenge-reward">
                  <strong>Reward:</strong> {dailyChallenge.reward.amount} {dailyChallenge.reward.currency}
                </div>
                
                <div className="challenge-actions">
                  <button className="accept-challenge-btn">Accept Challenge</button>
                  <button className="skip-challenge-btn">Skip (Next in 24h)</button>
                </div>
              </div>
            )}

            <div className="challenge-types">
              <h3>🎲 Challenge Categories</h3>
              <div className="challenge-grid">
                <div className="challenge-type">
                  <h4>⚔️ Combat Challenges</h4>
                  <p>PvP combat, hunting, and apex predator trials</p>
                  <div className="type-rewards">Rewards: Razor Talons, Combat Titles</div>
                </div>
                
                <div className="challenge-type">
                  <h4>🌿 Peaceful Challenges</h4>
                  <p>Herbivore survival, herd leadership, growth challenges</p>
                  <div className="type-rewards">Rewards: Sylvan Shards, Peace Titles</div>
                </div>
                
                <div className="challenge-type">
                  <h4>🗺️ Exploration Challenges</h4>
                  <p>Map discovery, landmark visits, survival expeditions</p>
                  <div className="type-rewards">Rewards: Void Pearls, Explorer Badges</div>
                </div>
                
                <div className="challenge-type">
                  <h4>👥 Social Challenges</h4>
                  <p>Community interaction, helping players, event participation</p>
                  <div className="type-rewards">Rewards: All Currencies, Social Titles</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'trivia' && (
          <div className="trivia-section">
            <div className="trivia-header">
              <h2>🧠 Isle Knowledge Trivia</h2>
              <div className="trivia-score">
                Score: {triviaScore}/{triviaQuestions.length} | 
                Reward: 10 Void Pearls per correct answer
              </div>
            </div>

            {currentQuestion < triviaQuestions.length ? (
              <div className="trivia-card">
                <div className="question-counter">
                  Question {currentQuestion + 1} of {triviaQuestions.length}
                </div>
                
                <h3 className="trivia-question">
                  {triviaQuestions[currentQuestion].question}
                </h3>
                
                <div className="trivia-options">
                  {triviaQuestions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      className={`trivia-option ${
                        showResult 
                          ? index === triviaQuestions[currentQuestion].correct 
                            ? 'correct' 
                            : index.toString() === selectedAnswer 
                              ? 'incorrect' 
                              : ''
                          : ''
                      }`}
                      onClick={() => handleTriviaAnswer(index.toString())}
                      disabled={showResult}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                
                {showResult && (
                  <div className="trivia-explanation">
                    <p><strong>Explanation:</strong> {triviaQuestions[currentQuestion].explanation}</p>
                    {selectedAnswer === triviaQuestions[currentQuestion].correct.toString() && (
                      <p className="reward-earned">+10 Void Pearls earned! 💎</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="trivia-complete">
                <h3>🎉 Trivia Complete!</h3>
                <p>Final Score: {triviaScore}/{triviaQuestions.length}</p>
                <p>Total Earned: {triviaScore * 10} Void Pearls</p>
                
                <div className="score-rating">
                  {triviaScore === triviaQuestions.length && "🏆 Perfect! You're a true Isle expert!"}
                  {triviaScore >= triviaQuestions.length * 0.8 && triviaScore < triviaQuestions.length && "🥈 Excellent! You know your dinosaurs!"}
                  {triviaScore >= triviaQuestions.length * 0.6 && triviaScore < triviaQuestions.length * 0.8 && "🥉 Good job! Keep learning!"}
                  {triviaScore < triviaQuestions.length * 0.6 && "📚 Study time! Check out our guides for tips!"}
                </div>
                
                <button className="play-again-btn" onClick={resetTrivia}>
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}

        {activeSection === 'events' && (
          <div className="events-section">
            <h2>🎉 Community Events</h2>
            <p>Join server-wide events, competitions, and special activities!</p>
            
            <div className="events-grid">
              {communityEvents.map(event => (
                <div key={event.id} className={`event-card ${event.status}`}>
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <span 
                      className="event-status"
                      style={{ color: getStatusColor(event.status) }}
                    >
                      {event.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-details">
                    <div className="event-time">
                      <strong>⏰ Time:</strong> {event.startTime}
                    </div>
                    <div className="event-duration">
                      <strong>⏱️ Duration:</strong> {event.duration}
                    </div>
                    <div className="event-participants">
                      <strong>👥 Participants:</strong> {event.participants}
                    </div>
                  </div>
                  
                  <div className="event-rewards">
                    <strong>🏆 Rewards:</strong> {event.rewards}
                  </div>
                  
                  <div className="event-actions">
                    {event.status === 'upcoming' && (
                      <button className="join-event-btn">Register for Event</button>
                    )}
                    {event.status === 'active' && (
                      <button className="join-event-btn active">Join Now!</button>
                    )}
                    {event.status === 'completed' && (
                      <button className="view-results-btn">View Results</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="event-calendar">
              <h3>📅 Upcoming Events This Week</h3>
              <div className="calendar-info">
                <p>• Daily login bonuses reset at 00:00 UTC</p>
                <p>• Weekly challenges refresh every Monday</p>
                <p>• Special holiday events announced in Discord</p>
                <p>• Community votes for next event themes</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'achievements' && (
          <div className="achievements-section">
            <h2>🏆 Achievement Progress</h2>
            <p>Track your progress across different gameplay categories!</p>
            
            {achievements.map((category, index) => (
              <div key={index} className="achievement-category">
                <h3>{category.category} Achievements</h3>
                
                <div className="achievements-list">
                  {category.items.map((achievement, achieveIndex) => (
                    <div 
                      key={achieveIndex} 
                      className={`achievement-item ${achievement.completed ? 'completed' : ''}`}
                    >
                      <div className="achievement-info">
                        <h4>{achievement.name}</h4>
                        <p>{achievement.description}</p>
                      </div>
                      
                      <div className="achievement-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ 
                              width: `${(achievement.progress / achievement.total) * 100}%`,
                              backgroundColor: achievement.completed ? '#32CD32' : '#FF4500'
                            }}
                          ></div>
                        </div>
                        <span className="progress-text">
                          {achievement.progress}/{achievement.total}
                        </span>
                      </div>
                      
                      {achievement.completed && (
                        <div className="achievement-badge">✅</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="achievement-rewards">
              <h3>🎁 Achievement Rewards</h3>
              <div className="rewards-info">
                <div className="reward-tier">
                  <strong>Bronze Achievements:</strong> 50-100 currency + basic titles
                </div>
                <div className="reward-tier">
                  <strong>Silver Achievements:</strong> 200-300 currency + rare titles
                </div>
                <div className="reward-tier">
                  <strong>Gold Achievements:</strong> 500+ currency + exclusive titles + special mutations
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Games;
