import {storiesOf} from '@storybook/react'
import React from 'react'
import TimelineNewFeature from 'universal/components/TimelineNewFeature'
import {RightDrawer} from '../src/universal/components/TimelineRightDrawer'
import StoryProvider from './components/StoryProvider'

const viewer = {
  newFeature: {
    copy: 'Parabol has a new timeline to keep track of your meeting history and team activity',
    url: 'https://www.parabol.co/blog'
  }
}
storiesOf('New Feature Card', module).add('new feature', () => (
  <StoryProvider>
    <RightDrawer>
      <TimelineNewFeature viewer={viewer} />
    </RightDrawer>
  </StoryProvider>
))
