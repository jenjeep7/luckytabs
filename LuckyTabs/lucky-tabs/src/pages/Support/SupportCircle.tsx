// pages/SupportCircle.tsx
import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const FUTURE_CONTENT = {
  recognizing: `Future content about recognizing excessive gaming behaviors will go here.`,
  warningSigns: `Future content about warning signs and self-assessment tools will go here.`,
  addiction: `Future content about addressing addiction and serious concerns will go here.`,
  healthierPatterns: `Future content about developing healthier gaming patterns will go here.`,
  maintainEnjoyment: `Future content about maintaining enjoyment while changing habits will go here.`,
  smallChanges: `Future content about practical small changes that make a big difference will go here.`,
  hotlineInfo: `Future content with hotline information and immediate support resources will go here.`,
  helpTypes: `Future content about different types of help available and how to access them will go here.`,
  faqSupport: `Future content with FAQ and guidance on getting support will go here.`,
  budgetTools: `Future content with interactive tools for budgeting and setting boundaries will go here.`,
  gamingHub: `Future content with a centralized dashboard for responsible gaming tools will go here.`,
  guidedSteps: `Future content with step-by-step guides for responsible gaming practices will go here.`,
  personalStories: `Future content with personal stories about recognizing problem gaming will go here.`,
  recoveryJourneys: `Future content with recovery stories and success journeys will go here.`,
  communityDiscussions: `Future content with community discussions and shared experiences will go here.`
};

const SECTIONS = [
  {
    title: `💡 Play should lift you up—not weigh you down`,
    description: `If the thrill feels tense, your pulse races in all the wrong ways, or you're hiding how much you've played—Tabsy wants you to check in, not check out. Spot the signs early, pause the pull, and find peace in the pause.`,
    accordions: [
      { title: `The Hidden Pull: Recognizing When It's Too Much`, content: 'recognizing' },
      { title: `Signs of Trouble: Is It Still Just for Fun?`, content: 'warningSigns' },
      { title: `When Winning Isn't Worth It: Facing Pull Tab Addiction`, content: 'addiction' }
    ]
  },
  {
    title: `🔁 Pull Smarter, Not Harder`,
    description: `Building better habits isn't about stopping—it's about swapping! Try Tabsy's favorite resets for more balanced gaming.`,
    accordions: [
      { title: `Swipe the Cycle: Building Healthier Gaming Routines`, content: 'healthierPatterns' },
      { title: `Breaking the Habit, Not the Fun`, content: 'maintainEnjoyment' },
      { title: `5 Small Switches for Big Impact`, content: 'smallChanges' }
    ]
  },
  {
    title: `📞 Big Feelings? Bigger Help`,
    description: `Whether it's a quick chat or a serious shift, help is just a call away. Tabsy's got the hotline list you'll actually want to save.`,
    accordions: [
      { title: `Pulling Back? You're Not Alone (Include hotline info or link to resources)`, content: 'hotlineInfo' },
      { title: `Reach Out, Rebalance: Help Is a Call Away`, content: 'helpTypes' },
      { title: `Got Questions, Need a Hand? Help is Here`, content: 'faqSupport' }
    ]
  },
  {
    title: `🧰 Game On, With a Game Plan`,
    description: `Budget builders, play trackers, and mindful moments—Tabsy's toolkit makes responsible gaming surprisingly fun.`,
    accordions: [
      { title: `Smart Play Toolkit: Budget, Boundaries, Balance`, content: 'budgetTools' },
      { title: `Your Responsible Gaming Hub`, content: 'gamingHub' },
      { title: `Guided Steps to Game Smarter`, content: 'guidedSteps' }
    ]
  },
  {
    title: `🤝 Real Talk from Real Pulls`,
    description: `True stories from fellow gamers about what changed, what helped, and what's still hard. You're not alone in this pull-tab journey.`,
    accordions: [
      { title: `"I Didn't See It Coming…" Stories from the Front Lines`, content: 'personalStories' },
      { title: `From Pull Tabs to Pulling Through: Recovery Journeys`, content: 'recoveryJourneys' },
      { title: `Community Voices: Let's Talk About It`, content: 'communityDiscussions' }
    ]
  }
];

export const SupportCircle = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          
          {SECTIONS.map((section, index) => (
            <Paper key={index} elevation={3} sx={{ p: 4, mb: 4, mt: index === 0 ? 4 : 0 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                {section.title}
              </Typography>
              <Typography sx={{ mb: 4 }}>
                {section.description}
              </Typography>
              
              <Box>
                {section.accordions.map((accordion, accordionIndex) => (
                  <Accordion key={accordionIndex}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography fontWeight="bold">{accordion.title}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography>{FUTURE_CONTENT[accordion.content as keyof typeof FUTURE_CONTENT]}</Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Paper>
          ))}

        </Box>
      </Container>
    </Box>
  );
};

