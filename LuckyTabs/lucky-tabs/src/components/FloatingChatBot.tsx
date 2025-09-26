import React, { useState, useRef, useEffect } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  IconButton,
  Typography,
  Paper,
  useTheme,
  alpha,
  Slide,
  CircularProgress
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { BoxItem } from '../services/boxService';
import { calculateAdvancedMetrics } from '../pages/Play/helpers';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface FloatingChatBotProps {
  boxes: BoxItem[];
  remainingTicketsInput?: { [key: string]: string };
}

export const FloatingChatBot: React.FC<FloatingChatBotProps> = ({
  boxes,
  remainingTicketsInput = {}
}) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Lucky Tabs advisor. I can help you choose the best boxes to play based on your budget and risk tolerance. Try asking me things like:\n\n• 'Which box has the best odds?'\n• 'What's the safest box for $20?'\n• 'Which box gives me the best chance at a big win?'",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analyzeBoxes = () => {
    return boxes.map(box => {
      const remainingTickets = Number(remainingTicketsInput[box.id]) || Number(box.estimatedRemainingTickets) || 0;
      const metrics = remainingTickets > 0 ? calculateAdvancedMetrics(box, remainingTickets) : null;
      
      return {
        box,
        remainingTickets,
        metrics,
        pricePerTicket: Number(box.pricePerTicket) || 0
      };
    }).filter(item => item.remainingTickets > 0 && item.metrics);
  };

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const boxAnalysis = analyzeBoxes();

    if (boxAnalysis.length === 0) {
      return "I don't see any active boxes with ticket estimates to analyze. Please add some boxes and estimate their remaining tickets first!";
    }

    // Best odds questions
    if (lowerMessage.includes('best odds') || lowerMessage.includes('highest odds')) {
      const bestBox = boxAnalysis.reduce((best, current) => 
        (current.metrics?.anyWinOdds.next5 ?? 0) > (best.metrics?.anyWinOdds.next5 ?? 0) ? current : best
      );
      
      const metrics = bestBox.metrics;
      if (!metrics) return "Unable to analyze box metrics.";
      
      return `**${bestBox.box.boxName}** has the best odds for winning something in your next 5 pulls at ${(metrics.anyWinOdds.next5 * 100).toFixed(1)}%.\n\nKey stats:\n• EV per ticket: $${metrics.evPerTicket.toFixed(2)}\n• RTP: ${metrics.rtpRemaining.toFixed(1)}%\n• Expected tickets to first win: ${metrics.expectedTicketsToFirstWin.toFixed(1)}`;
    }

    // Best value questions
    if (lowerMessage.includes('best value') || lowerMessage.includes('best ev') || lowerMessage.includes('most profitable')) {
      const bestValueBox = boxAnalysis.reduce((best, current) => 
        (current.metrics?.evPerTicket ?? -Infinity) > (best.metrics?.evPerTicket ?? -Infinity) ? current : best
      );
      
      const metrics = bestValueBox.metrics;
      if (!metrics) return "Unable to analyze box metrics.";
      
      return `**${bestValueBox.box.boxName}** offers the best value with an EV of $${metrics.evPerTicket.toFixed(2)} per ticket.\n\nAt $${bestValueBox.pricePerTicket} per ticket, you're getting ${metrics.evPerDollar.toFixed(2)}× return on investment.\n\nThis box has ${metrics.rtpRemaining.toFixed(1)}% RTP remaining.`;
    }

    // Safest box questions
    if (lowerMessage.includes('safest') || lowerMessage.includes('low risk') || lowerMessage.includes('conservative')) {
      const safestBox = boxAnalysis.reduce((safest, current) => 
        (current.metrics?.riskPerTicket ?? Infinity) < (safest.metrics?.riskPerTicket ?? Infinity) ? current : safest
      );
      
      const metrics = safestBox.metrics;
      if (!metrics) return "Unable to analyze box metrics.";
      
      return `**${safestBox.box.boxName}** is your safest option with the lowest risk per ticket at $${metrics.riskPerTicket.toFixed(2)}.\n\nThis box offers:\n• Steady ${(metrics.anyWinOdds.next5 * 100).toFixed(1)}% chance of winning in 5 pulls\n• RTP: ${metrics.rtpRemaining.toFixed(1)}%\n• Less volatile outcomes`;
    }

    // Budget-specific questions
    const budgetMatch = lowerMessage.match(/\$?(\d+)/);
    if (budgetMatch && (lowerMessage.includes('budget') || lowerMessage.includes('spend') || lowerMessage.includes('for'))) {
      const budget = parseInt(budgetMatch[1]);
      const recommendations = boxAnalysis.map(item => {
        const ticketsAffordable = Math.floor(budget / item.pricePerTicket);
        const profitProb = item.metrics?.probabilityOfProfit.budget20 ?? 0; // Use closest budget tier
        
        return {
          ...item,
          ticketsAffordable,
          profitProb,
          expectedReturn: ticketsAffordable * (item.metrics?.evPerTicket ?? 0)
        };
      }).filter(item => item.ticketsAffordable > 0)
        .sort((a, b) => b.expectedReturn - a.expectedReturn);

      if (recommendations.length === 0) {
        return `With $${budget}, you can't afford any tickets from the current boxes. The cheapest ticket costs $${Math.min(...boxAnalysis.map(b => b.pricePerTicket))}.`;
      }

      const topRec = recommendations[0];
      const anyWinOddsNext1 = topRec.metrics?.anyWinOdds.next1 ?? 0;
      return `For $${budget}, I recommend **${topRec.box.boxName}**!\n\nYou can buy ${topRec.ticketsAffordable} tickets at $${topRec.pricePerTicket} each.\n\nExpected return: $${(budget + topRec.expectedReturn).toFixed(2)} (profit: $${topRec.expectedReturn.toFixed(2)})\n\nYour odds of winning something: ${(1 - Math.pow(1 - anyWinOddsNext1, topRec.ticketsAffordable) * 100).toFixed(1)}%`;
    }

    // Big win / jackpot questions
    if (lowerMessage.includes('big win') || lowerMessage.includes('jackpot') || lowerMessage.includes('top prize')) {
      const bigWinBox = boxAnalysis.reduce((best, current) => 
        (current.metrics?.topPrizeOdds.next10 ?? 0) > (best.metrics?.topPrizeOdds.next10 ?? 0) ? current : best
      );
      
      const metrics = bigWinBox.metrics;
      if (!metrics) return "Unable to analyze box metrics.";
      
      return `For big wins, try **${bigWinBox.box.boxName}**!\n\nTop-tier prize odds in next 10 pulls: ${(metrics.topPrizeOdds.next10 * 100).toFixed(1)}%\n\nThis box has:\n• High payout concentration: ${(metrics.payoutConcentration * 100).toFixed(1)}%\n• Big prizes still available\n• Worth the risk if you're chasing large wins`;
    }

    // Comparison questions
    if (lowerMessage.includes('compare') || lowerMessage.includes('which is better')) {
      const sortedByValue = [...boxAnalysis].sort((a, b) => (b.metrics?.evPerTicket ?? 0) - (a.metrics?.evPerTicket ?? 0));
      
      let response = "Here's how your boxes compare:\n\n";
      sortedByValue.forEach((item, index) => {
        const rank = index + 1;
        const emoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '📊';
        const metrics = item.metrics;
        if (metrics) {
          response += `${emoji} **${item.box.boxName}**\n`;
          response += `   EV: $${metrics.evPerTicket.toFixed(2)} | RTP: ${metrics.rtpRemaining.toFixed(1)}% | Win odds: ${(metrics.anyWinOdds.next5 * 100).toFixed(1)}%\n\n`;
        }
      });
      
      return response;
    }

    // Quick suggestions
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return `🎯 **I can help you make smart box choices!**\n\n**Quick Commands:**\n• "best odds" - Find boxes with highest win probability\n• "best value" - Find most profitable boxes\n• "safest" - Find low-risk boxes\n• "big win" - Find boxes good for jackpot hunting\n• "compare" - See all your boxes ranked\n• "$20" or "$50" - Get recommendations for your budget\n• "what should I play?" - Get personalized recommendation\n\n**Smart Analysis:**\nI analyze your boxes using advanced probability calculations including EV (Expected Value), RTP (Return to Player), risk assessment, and hypergeometric odds. Just ask me anything!`;
    }

    // Personalized recommendation
    if (lowerMessage.includes('what should i play') || lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      const bestValueBox = boxAnalysis.reduce((best, current) => 
        (current.metrics?.evPerTicket ?? -Infinity) > (best.metrics?.evPerTicket ?? -Infinity) ? current : best
      );
      
      const metrics = bestValueBox.metrics;
      if (!metrics) return "Unable to analyze box metrics.";
      
      return `🎯 **My Top Recommendation: ${bestValueBox.box.boxName}**\n\n**Why this box:**\n• Best EV: $${metrics.evPerTicket.toFixed(2)} per ticket\n• ${metrics.evPerDollar.toFixed(2)}× return multiple\n• ${(metrics.anyWinOdds.next5 * 100).toFixed(1)}% chance to win in 5 pulls\n• RTP: ${metrics.rtpRemaining.toFixed(1)}%\n\n**Strategy:** ${metrics.evPerTicket > 0 ? "This box is profitable! 💰" : "This box has negative EV - play for fun only! 🎮"}\n\nWant specifics for your budget? Just ask "What's best for $X?"`;
    }

    // Risk tolerance questions
    if (lowerMessage.includes('risk tolerance') || lowerMessage.includes('how risky')) {
      const riskLevels = boxAnalysis.map(item => ({
        ...item,
        riskLevel: item.metrics?.riskPerTicket ?? 0,
        riskCategory: (item.metrics?.riskPerTicket ?? 0) <= 2 ? 'Low' : 
                     (item.metrics?.riskPerTicket ?? 0) <= 5 ? 'Medium' : 
                     (item.metrics?.riskPerTicket ?? 0) <= 10 ? 'High' : 'Extreme'
      })).sort((a, b) => a.riskLevel - b.riskLevel);

      let response = "📊 **Risk Analysis of Your Boxes:**\n\n";
      riskLevels.forEach(item => {
        const riskEmoji = item.riskCategory === 'Low' ? '🟢' : 
                         item.riskCategory === 'Medium' ? '🟡' : 
                         item.riskCategory === 'High' ? '🟠' : '🔴';
        response += `${riskEmoji} **${item.box.boxName}**: ${item.riskCategory} Risk ($${item.riskLevel.toFixed(2)} volatility)\n`;
      });
      
      response += `\n**Risk Guide:**\n🟢 Low: Steady, predictable outcomes\n🟡 Medium: Some ups and downs\n🟠 High: Big swings possible\n🔴 Extreme: Very volatile, big wins or losses`;
      
      return response;
    }

    // General advice - default response
    return `I can help you choose the best box! Try asking me:\n\n• "Which box has the best odds?"\n• "What's the safest box?"\n• "Which box is best for $50?"\n• "Compare my boxes"\n• "Which box gives me the best chance at a big win?"\n• "What should I play?"\n• "Help" - See all my commands\n\nI'll analyze all your boxes and give you personalized recommendations!`;
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(messageToProcess);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // 1-2 second delay
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          background: `linear-gradient(135deg, ${theme.neon.colors.cyan}, ${theme.neon.colors.purple})`,
          color: 'white',
          ...theme.neon.effects.boxGlow(theme.neon.colors.cyan, 0.3),
          '&:hover': {
            ...theme.neon.effects.boxGlow(theme.neon.colors.cyan, 0.5),
            transform: 'scale(1.05)',
          },
          transition: 'all 0.3s ease'
        }}
        onClick={() => setOpen(true)}
      >
        <ChatIcon />
      </Fab>

      {/* Chat Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '70vh',
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)}, ${alpha(theme.palette.background.default, 0.95)})`,
            backdropFilter: 'blur(10px)',
            ...theme.neon.effects.boxGlow(theme.neon.colors.cyan, 0.1),
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${theme.neon.colors.cyan}, ${theme.neon.colors.purple})`,
            color: 'white',
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BotIcon />
            <Typography variant="h6">Lucky Tabs AI Advisor</Typography>
          </Box>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.isBot ? 'flex-start' : 'flex-end'
                }}
              >
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    background: message.isBot
                      ? `linear-gradient(135deg, ${alpha(theme.neon.colors.cyan, 0.1)}, ${alpha(theme.neon.colors.purple, 0.1)})`
                      : `linear-gradient(135deg, ${theme.neon.colors.green}, ${theme.neon.colors.cyan})`,
                    color: message.isBot ? 'text.primary' : 'white',
                    borderRadius: 2,
                    ...(message.isBot && {
                      border: `1px solid ${alpha(theme.neon.colors.cyan, 0.3)}`
                    })
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      '& strong': {
                        fontWeight: 'bold',
                        color: message.isBot ? theme.neon.colors.cyan : 'inherit'
                      }
                    }}
                  >
                    {message.text}
                  </Typography>
                </Paper>
              </Box>
            ))}
            
            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Paper
                  sx={{
                    p: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.neon.colors.cyan, 0.1)}, ${alpha(theme.neon.colors.purple, 0.1)})`,
                    border: `1px solid ${alpha(theme.neon.colors.cyan, 0.3)}`,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <CircularProgress size={16} sx={{ color: theme.neon.colors.cyan }} />
                  <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                    AI is thinking...
                  </Typography>
                </Paper>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${alpha(theme.neon.colors.cyan, 0.2)}`,
              display: 'flex',
              gap: 1
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your boxes... (e.g., 'Which box is best for $50?')"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: alpha(theme.neon.colors.cyan, 0.3),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha(theme.neon.colors.cyan, 0.5),
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.neon.colors.cyan,
                  },
                }
              }}
            />
            <IconButton
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              sx={{
                background: `linear-gradient(135deg, ${theme.neon.colors.cyan}, ${theme.neon.colors.purple})`,
                color: 'white',
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.neon.colors.purple}, ${theme.neon.colors.cyan})`,
                },
                '&.Mui-disabled': {
                  background: alpha(theme.palette.action.disabled, 0.12),
                  color: alpha(theme.palette.action.disabled, 0.26),
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};