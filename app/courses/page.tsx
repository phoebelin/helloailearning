'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, LayoutHeader, LayoutContent } from '@astryxdesign/core/Layout';
import { Text, Heading } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { ToggleButton, ToggleButtonGroup } from '@astryxdesign/core/ToggleButton';
import { TextInput } from '@astryxdesign/core/TextInput';
import { Grid } from '@astryxdesign/core/Grid';
import { HStack, VStack, StackItem } from '@astryxdesign/core/Stack';
import { DropdownMenu } from '@astryxdesign/core/DropdownMenu';
import { OverflowList } from '@astryxdesign/core/OverflowList';
import { Center } from '@astryxdesign/core/Center';
import { AppShell } from '@astryxdesign/core/AppShell';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Nav } from '@/components/nav';

interface Chapter {
  id: string;
  name: string;
  description: string;
  category: string;
  gradeBand: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
}

const CATEGORIES = ['All', 'Basics of AI'];
const GRADE_BANDS = ['All grades', '3-5th grade', '6-8th grade', '9-12th grade'];

const thumbnailWrapper: CSSProperties = {
  position: 'relative',
  aspectRatio: '1/1',
  overflow: 'hidden',
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
const thumbnailImage: CSSProperties = {
  maxWidth: '75%',
  maxHeight: '75%',
  objectFit: 'contain',
};

function ChapterCard({
  chapter,
  onNavigate,
}: {
  chapter: Chapter;
  onNavigate: (href: string) => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onNavigate(chapter.href)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onNavigate(chapter.href);
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <Card padding={0}>
        <div style={thumbnailWrapper}>
          <img src={chapter.imageSrc} alt={chapter.imageAlt} style={thumbnailImage} />
        </div>
        <VStack gap={1} width="100%" style={{ padding: '16px' }}>
          <Heading level={3}>{chapter.name}</Heading>
          <Text type="body" size="sm" color="secondary">
            {chapter.description}
          </Text>
        </VStack>
      </Card>
    </div>
  );
}

const CHAPTERS: Chapter[] = [
  {
    id: '1',
    name: 'Chapter 1',
    description: 'How machines learn with Zhorai',
    category: 'Basics of AI',
    gradeBand: '3-5th grade',
    href: '/lessons/how-machines-learn',
    imageSrc: '/images/zhorai-course.png',
    imageAlt: 'Zhorai',
  },
  {
    id: '2',
    name: 'Chapter 2',
    description: 'How machines use patterns with Mori',
    category: 'Basics of AI',
    gradeBand: '3-5th grade',
    href: '/lessons/how-machines-use-patterns',
    imageSrc: '/images/mori-course.png',
    imageAlt: 'Mori',
  },
  {
    id: '3',
    name: 'Chapter 3',
    description: 'How machines update understanding with Pippy',
    category: 'Basics of AI',
    gradeBand: '3-5th grade',
    href: '/lessons/how-machines-update-understanding',
    imageSrc: '/images/pippy.png',
    imageAlt: 'Pippy',
  },
  {
    id: '4',
    name: 'Chapter 4',
    description: 'How machines chase goals with Coda',
    category: 'Basics of AI',
    gradeBand: '3-5th grade',
    href: '/lessons/how-machines-chase-goals',
    imageSrc: '/images/coda.png',
    imageAlt: 'Coda',
  },
];

export default function CoursesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [gradeBand, setGradeBand] = useState('All grades');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let items =
      activeCategory === 'All' ? CHAPTERS : CHAPTERS.filter((c) => c.category === activeCategory);
    if (gradeBand !== 'All grades') {
      items = items.filter((c) => c.gradeBand === gradeBand);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
      );
    }
    return items;
  }, [activeCategory, gradeBand, search]);

  return (
    <AppShell topNav={<Nav />} contentPadding={0} height="auto">
      <Layout
        height="auto"
        header={
          <LayoutHeader padding={6} className="relative">
            <Heading level={1}>Courses</Heading>
            <div className="absolute inset-x-6 bottom-0 border-b border-hairline" />
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={6}>
            <VStack gap={6}>
              <VStack gap={4}>
                <TextInput
                  label="Search"
                  isLabelHidden
                  placeholder="Search chapters..."
                  value={search}
                  onChange={setSearch}
                  startIcon={MagnifyingGlassIcon}
                  size="lg"
                />
                <HStack vAlign="center" gap={4}>
                  <StackItem size="fill">
                    <VStack>
                      <ToggleButtonGroup
                        label="Filter by category"
                        value={activeCategory}
                        onChange={(v) => setActiveCategory(v ?? 'All')}
                      >
                        <OverflowList
                          gap={1}
                          behavior="observeParent"
                          overflowRenderer={(overflowItems) => (
                            <DropdownMenu
                              button={{
                                label: `+${overflowItems.length}`,
                                variant: 'ghost',
                                size: 'lg',
                              }}
                              items={overflowItems.map(({ index }) => ({
                                label: CATEGORIES[index],
                                onClick: () => setActiveCategory(CATEGORIES[index]),
                              }))}
                            />
                          )}
                        >
                          {CATEGORIES.map((cat) => (
                            <ToggleButton key={cat} label={cat} value={cat} size="lg" />
                          ))}
                        </OverflowList>
                      </ToggleButtonGroup>
                    </VStack>
                  </StackItem>
                  <DropdownMenu
                    button={{ label: gradeBand, size: 'lg' }}
                    items={GRADE_BANDS.map((band) => ({
                      label: band,
                      onClick: () => setGradeBand(band),
                    }))}
                  />
                </HStack>
              </VStack>

              {filtered.length === 0 ? (
                <Center>
                  <Text type="supporting" color="secondary">
                    No chapters found.
                  </Text>
                </Center>
              ) : (
                <Grid columns={{ minWidth: 261, max: 4 }} gap={6}>
                  {filtered.map((chapter) => (
                    <ChapterCard
                      key={chapter.id}
                      chapter={chapter}
                      onNavigate={(href) => router.push(href)}
                    />
                  ))}
                </Grid>
              )}
            </VStack>
          </LayoutContent>
        }
      />
    </AppShell>
  );
}
