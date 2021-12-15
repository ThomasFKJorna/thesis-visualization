import * as React from 'react'
import { useScrollSpy } from '../../hooks/useScrollSpy'
import {
  Box,
  ListItem,
  OrderedList,
  chakra,
  Text,
  useColorModeValue,
  BoxProps,
  HStack,
  Icon,
} from '@chakra-ui/react'
import { Heading } from '../../pages/[...file]'
import { VscCircleOutline } from 'react-icons/vsc'
import { FaRegDotCircle } from 'react-icons/fa'

interface TableOfContentProps extends BoxProps {
  headings: Heading[]
}

function TableOfContent(props: TableOfContentProps) {
  const { headings, ...rest } = props
  const activeId = useScrollSpy(
    headings.map(({ id }) => `[id="${id}"]`),
    {
      rootMargin: '0% 0% -24% 0%',
    },
  )
  const linkColor = useColorModeValue('gray.600', 'gray.400')
  const linkHoverColor = useColorModeValue('gray.900', 'gray.600')
  return (
    <>
      <OrderedList spacing={1} ml="0" styleType="none">
        {headings.map(({ id, text, level }) => (
          <ListItem
            key={id}
            title={text}
            ml={level === 'h3' ? '4' : level === 'h4' ? '8' : undefined}
          >
            <HStack justifyContent="flex-start" spacing="2px" alignItems="baseline">
              {id === activeId && (
                <Box backgroundColor="red.500" h={3} mb={-2} w="2px" mr={1} ml={-2} />
              )}
              <chakra.a
                textAlign="left"
                py="2px"
                display="block"
                fontWeight={id === activeId ? 'bold' : 'medium'}
                href={`#${id}`}
                aria-current={id === activeId ? 'location' : undefined}
                color={linkColor}
                _hover={{
                  color: linkHoverColor,
                }}
              >
                {text}
              </chakra.a>
            </HStack>
          </ListItem>
        ))}
      </OrderedList>
    </>
  )
}

export default TableOfContent
