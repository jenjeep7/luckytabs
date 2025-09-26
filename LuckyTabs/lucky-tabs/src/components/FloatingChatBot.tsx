import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
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
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { BoxItem } from '../services/boxService';
import { calculateAdvancedMetrics, AdvancedMetrics } from '../pages/Play/helpers';

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

interface PickResult {
  box_id: string;
  rank: number;
  reason: string;
}

interface BoxAnalysis {
  box: BoxItem;
  remainingTickets: number;
  metrics: AdvancedMetrics | null;
  pricePerTicket: number;
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
      text: "Hi! I'm Tabsy, your advisor. I can help you choose the best boxes to play based on your budget and risk tolerance. Try asking me things like:\n\n• 'Which box has the best odds?'\n• 'What's the safest box for $20?'\n• 'Which box gives me the best chance at a big win?'",
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

  // LLM Integration via server-side API
  const queryLLM = async (message: string, analyses: BoxAnalysis[]): Promise<string | null> => {
    try {
      // Prepare structured data for the server
      const payload = analyses.map(a => ({
        id: a.box.id,
        name: a.box.boxName || 'Unknown',
        price_per_ticket: a.pricePerTicket,
        ev: Number(a.metrics?.evPerTicket?.toFixed(2) ?? 0),
        rtp: Number(a.metrics?.rtpRemaining?.toFixed(1) ?? 0),
        risk: Number(a.metrics?.riskPerTicket?.toFixed(2) ?? 0),
        p_win_next1: Number(a.metrics?.anyWinOdds?.next1?.toFixed(4) ?? 0),
        p_win_next5: Number(a.metrics?.anyWinOdds?.next5?.toFixed(4) ?? 0),
        p_top_next10: Number(a.metrics?.topPrizeOdds?.next10?.toFixed(4) ?? 0),
      }));

      const response = await fetch('https://boxadvisor-hnzwvyldha-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, boxes: payload })
      });

      if (!response.ok) {
        console.warn(`Server API error: ${response.status}`);
        return null;
      }

      const data = await response.json() as { answerMarkdown: string; picks: PickResult[] };
      return data.answerMarkdown;
    } catch (error) {
      console.warn('LLM server query failed:', error);
      return null;
    }
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
      const combinedWinOdds = (1 - Math.pow(1 - anyWinOddsNext1, topRec.ticketsAffordable)) * 100;
      return `For $${budget}, I recommend **${topRec.box.boxName}**!\n\nYou can buy ${topRec.ticketsAffordable} tickets at $${topRec.pricePerTicket} each.\n\nExpected return: $${(budget + topRec.expectedReturn).toFixed(2)} (profit: $${topRec.expectedReturn.toFixed(2)})\n\nYour odds of winning something: ${combinedWinOdds.toFixed(1)}%`;
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

  const handleSend = async () => {
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

    try {
      // First, try rule-based response for fast, reliable answers
      const ruleResponse = generateResponse(messageToProcess);
      
      // Check if it's a generic fallback response (indicates complex query)
      const isGenericResponse = ruleResponse.includes("I can help you choose the best box!");
      
      let finalResponse = ruleResponse;
      
      // If it's a complex query and we have API available, try LLM
      if (isGenericResponse) {
        const boxData = analyzeBoxes();
        const llmResponse = await queryLLM(messageToProcess, boxData);
        
        if (llmResponse) {
          finalResponse = `🤖 **AI Analysis:** ${llmResponse}`;
        } else {
          // LLM failed, add helpful context to rule-based response
          finalResponse = `🎯 **Quick Help:** ${ruleResponse}\n\n💡 **Tip:** For more detailed analysis, try asking specific questions like "which box has the best odds?" or "compare my boxes".`;
        }
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: finalResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try asking a specific question like 'Which box has the best odds?' or 'What's the safest box?'",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button with Tabsy Logo */}
      <Fab
        sx={{
          position: 'fixed',
          top: 100,
          right: 20,
          zIndex: 1300,
          width: 56,
          height: 56,
          background: `radial-gradient(circle at center, ${theme.neon.colors.cyan}40, ${theme.neon.colors.purple}20, transparent 70%)`,
          backgroundColor: alpha(theme.palette.background.paper, 0.1),
          border: `2px solid ${theme.neon.colors.cyan}`,
          backdropFilter: 'blur(10px)',
          boxShadow: [
            `0 0 20px ${alpha(theme.neon.colors.cyan, 0.5)}`,
            `inset 0 0 20px ${alpha(theme.neon.colors.cyan, 0.1)}`,
            `0 0 40px ${alpha(theme.neon.colors.cyan, 0.3)}`
          ].join(', '),
          '&:hover': {
            backgroundColor: alpha(theme.neon.colors.cyan, 0.1),
            transform: 'scale(1.1)',
            boxShadow: [
              `0 0 30px ${alpha(theme.neon.colors.cyan, 0.8)}`,
              `inset 0 0 30px ${alpha(theme.neon.colors.cyan, 0.2)}`,
              `0 0 60px ${alpha(theme.neon.colors.cyan, 0.5)}`
            ].join(', '),
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: -2,
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, ${theme.neon.colors.cyan}, ${theme.neon.colors.purple}, ${theme.neon.colors.pink}, ${theme.neon.colors.cyan})`,
            mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
            maskComposite: 'xor',
            WebkitMaskComposite: 'xor',
            padding: '2px',
            zIndex: -1,
            opacity: 0.7,
            animation: 'rotate 3s linear infinite'
          },
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }}
        onClick={() => setOpen(true)}
      >
        <img 
          src="/Tabsy8.png" 
          alt="Tabsy AI Chat" 
          style={{ 
            width: '48px', 
            height: '48px',
            borderRadius: '50%',
            filter: `drop-shadow(0 0 8px ${theme.neon.colors.cyan})` 
          }} 
        />
      </Fab>

      {/* Chat Dialog with Enhanced Neon */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            height: '70vh',
            background: `radial-gradient(ellipse at top, ${alpha(theme.neon.colors.purple, 0.1)}, ${alpha(theme.palette.background.paper, 0.95)} 50%, ${alpha(theme.neon.colors.cyan, 0.05)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(theme.neon.colors.cyan, 0.2)}`,
            boxShadow: [
              `0 0 50px ${alpha(theme.neon.colors.cyan, 0.3)}`,
              `inset 0 0 50px ${alpha(theme.neon.colors.purple, 0.1)}`,
              `0 0 100px ${alpha(theme.neon.colors.cyan, 0.2)}`
            ].join(', '),
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, ${alpha(theme.neon.colors.cyan, 0.1)}, transparent 30%, ${alpha(theme.neon.colors.purple, 0.05)} 60%, transparent)`,
              pointerEvents: 'none',
              zIndex: 1
            }
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
            py: 2,
            position: 'relative',
            zIndex: 2,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `black`,
              zIndex: -1
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img 
              src="/Tabsy8.png" 
              alt="Tabsy Logo" 
              style={{ 
                height: '48px', 
                width: 'auto',
              }} 
            />
            <Typography 
              variant="body1" 
              sx={{ 
                textShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
                fontWeight: 'bold'
              }}
            >
              Lucky Tabs AI Advisor
            </Typography>
          </Box>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Messages Area with Custom Scrollbar */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              position: 'relative',
              zIndex: 2,
              // Custom Neon Scrollbar
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: alpha(theme.palette.background.default, 0.3),
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: `linear-gradient(45deg, ${theme.neon.colors.cyan}, ${theme.neon.colors.purple})`,
                borderRadius: '10px',
                boxShadow: `0 0 10px ${alpha(theme.neon.colors.cyan, 0.5)}`,
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: `linear-gradient(45deg, ${theme.neon.colors.purple}, ${theme.neon.colors.cyan})`,
                boxShadow: `0 0 15px ${alpha(theme.neon.colors.cyan, 0.7)}`,
              }
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
                      ? `radial-gradient(ellipse at bottom left, ${alpha(theme.neon.colors.cyan, 0.15)}, ${alpha(theme.neon.colors.purple, 0.1)}, ${alpha(theme.palette.background.paper, 0.95)})`
                      : `linear-gradient(135deg, ${theme.neon.colors.green}, ${theme.neon.colors.cyan})`,
                    color: message.isBot ? 'text.primary' : 'white',
                    borderRadius: message.isBot ? '20px 20px 20px 5px' : '20px 20px 5px 20px',
                    border: message.isBot 
                      ? `1px solid ${alpha(theme.neon.colors.cyan, 0.3)}` 
                      : `1px solid ${alpha(theme.neon.colors.green, 0.5)}`,
                    boxShadow: message.isBot
                      ? [
                          `0 0 20px ${alpha(theme.neon.colors.cyan, 0.2)}`,
                          `inset 0 0 20px ${alpha(theme.neon.colors.cyan, 0.05)}`
                        ].join(', ')
                      : [
                          `0 0 20px ${alpha(theme.neon.colors.green, 0.3)}`,
                          `inset 0 0 20px ${alpha(theme.neon.colors.green, 0.1)}`
                        ].join(', '),
                    position: 'relative',
                    '&::before': message.isBot ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(45deg, ${alpha(theme.neon.colors.cyan, 0.05)}, transparent 70%)`,
                      borderRadius: 'inherit',
                      pointerEvents: 'none',
                      zIndex: -1
                    } : {}
                  }}
                >
                  <ReactMarkdown
                    components={{
                      // Customize rendering for better styling
                      strong: ({...props}) => (
                        <Typography 
                          component="span" 
                          sx={{ 
                            fontWeight: 'bold',
                            color: message.isBot ? theme.neon.colors.cyan : 'inherit'
                          }} 
                          {...props} 
                        />
                      ),
                      p: ({...props}) => (
                        <Typography variant="body2" component="div" sx={{ mb: 1 }} {...props} />
                      ),
                      li: ({...props}) => (
                        <Typography variant="body2" component="li" {...props} />
                      )
                    }}
                  >
                    {message.text}
                  </ReactMarkdown>
                  
                  {message.isBot && message.text.includes('AI Analysis') && (
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        fontStyle: 'italic',
                        color: 'text.secondary',
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        pt: 1
                      }}
                    >
                      ⚠️ Play for entertainment only - never gamble more than you can afford to lose.
                    </Typography>
                  )}
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

          {/* Input Area with Enhanced Neon */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${alpha(theme.neon.colors.cyan, 0.2)}`,
              display: 'flex',
              gap: 1,
              position: 'relative',
              zIndex: 2,
              background: `linear-gradient(90deg, ${alpha(theme.neon.colors.cyan, 0.02)}, ${alpha(theme.neon.colors.purple, 0.01)})`,
              backdropFilter: 'blur(10px)'
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
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)}, ${alpha(theme.palette.background.default, 0.9)})`,
                  backdropFilter: 'blur(10px)',
                  border: `1px solid ${alpha(theme.neon.colors.cyan, 0.3)}`,
                  borderRadius: '15px',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover': {
                    borderColor: alpha(theme.neon.colors.cyan, 0.5),
                    boxShadow: `0 0 15px ${alpha(theme.neon.colors.cyan, 0.2)}`,
                  },
                  '&.Mui-focused': {
                    borderColor: theme.neon.colors.cyan,
                    boxShadow: `0 0 25px ${alpha(theme.neon.colors.cyan, 0.4)}`,
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    '&::placeholder': {
                      color: alpha(theme.neon.colors.cyan, 0.5),
                      opacity: 1,
                    },
                    '&.Mui-focused::placeholder': {
                      color: alpha(theme.neon.colors.cyan, 0.5),
                      opacity: 1,
                    }
                  }
                }
              }}
            />
            <IconButton
              onClick={() => void handleSend()}
              disabled={!inputValue.trim() || isTyping}
              sx={{
                width: 48,
                height: 48,
                background: `radial-gradient(circle, ${alpha(theme.neon.colors.cyan, 0.2)}, ${alpha(theme.neon.colors.purple, 0.1)})`,
                border: `1px solid ${alpha(theme.neon.colors.cyan, 0.3)}`,
                color: theme.neon.colors.cyan,
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  background: `radial-gradient(circle, ${alpha(theme.neon.colors.cyan, 0.3)}, ${alpha(theme.neon.colors.purple, 0.2)})`,
                  borderColor: alpha(theme.neon.colors.cyan, 0.6),
                  transform: 'scale(1.05)',
                  boxShadow: `0 0 25px ${alpha(theme.neon.colors.cyan, 0.4)}`,
                },
                '&.Mui-disabled': {
                  background: alpha(theme.palette.background.default, 0.1),
                  color: alpha(theme.palette.action.disabled, 0.3),
                  borderColor: alpha(theme.palette.action.disabled, 0.1)
                },
                transition: 'all 0.2s ease'
              }}
            >
              <SendIcon sx={{ 
                filter: !inputValue.trim() || isTyping 
                  ? 'none' 
                  : `drop-shadow(0 0 5px ${alpha(theme.neon.colors.cyan, 0.5)})` 
              }} />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};