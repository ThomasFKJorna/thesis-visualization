import {
  Text,
  Flex,
  VStack,
  CloseButton,
  HStack,
  Heading,
  Box,
  Container,
  Icon,
  useDisclosure,
  IconButton,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  Slide,
} from '@chakra-ui/react'
import { Collapse } from './Collapse'
import React, { useState } from 'react'
import { Resizable } from 're-resizable'
import Link from 'next/link'
import { File, Files } from '../../pages/[...file]'
import { slugify } from '../../utils/slug'
import { BsFileEarmarkText } from 'react-icons/bs'
import { ChevronDownIcon, ChevronRightIcon, HamburgerIcon } from '@chakra-ui/icons'

interface Props {
  items: Files
  isOpen: boolean
  onClose: any
}

const CustomSideBar = (props: Props) => {
  const { items, isOpen, onClose } = props
  const [hideContent, setHideContent] = useState(true)
  const bg = useColorModeValue('gray.50', 'gray.800')
  const unemph = useColorModeValue('gray.700', 'gray.300')
  return (
    <Collapse
      animateOpacity={false}
      dimension="width"
      in={isOpen}
      style={{ position: 'sticky', top: 0 }}
      // startingSize={0}
      // endingSize="25vw"
      //  unmountOnExit
    >
      <VStack
        borderRightWidth={1}
        pl={1}
        pr="3%"
        display="flex"
        backgroundColor={bg}
        // pt="1%"
        alignItems="flex-start"
        w="25vw"
        overflowX="auto"
        overflowY="scroll"
        h="100vh"
        style={{ position: 'sticky', top: 0 }}
        //  position="fixed"
      >
        <HStack ml={4} mt={3} alignItems="center" pos="sticky" top={0}>
          <IconButton
            aria-label="close sidebar"
            icon={<HamburgerIcon />}
            onClick={onClose}
            variant="ghost"
            color={unemph}
          />

          <Text color={unemph}>Files</Text>
        </HStack>
        <Box>
          {Object.entries(items.folders)
            .reverse()
            .map(([folder, files]) => (
              <SubMenu {...{ folder, files }} defaultIsOpen={['Chapters'].includes(folder)} />
            ))}
          <SubMenu folder="Notes" files={items.files} defaultIsOpen />
        </Box>
      </VStack>
    </Collapse>
  )
}

export interface SubMenuProps {
  folder: string
  files: File[]
  defaultIsOpen?: boolean
}
export const SubMenu = (props: SubMenuProps) => {
  const { folder, files, defaultIsOpen } = props

  const { onToggle, isOpen } = useDisclosure({ defaultIsOpen: defaultIsOpen && true })
  const iconColor = useColorModeValue('gray.600', 'gray.300')
  return (
    <Box>
      <Container ml={2} mt={4} mb={2}>
        <HStack alignItems="center">
          <Heading size="sm">{folder}</Heading>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Close section"
            icon={isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
            onClick={onToggle}
          />
        </HStack>
      </Container>
      {isOpen && (
        <VStack pl={2} pr="5%" display="flex" w="full" alignItems="flex-start" spacing={4}>
          {files.map((item: File) => (
            <Container>
              <HStack alignItems="baseline">
                {/* <Icon as={BsFileEarmarkText} color={iconColor} mt={1} height={3} /> */}
                <Text fontWeight="500" fontSize={14} textTransform="capitalize">
                  <Link prefetch={false} href={`/${slugify(item.path)}`} key={item.path}>
                    {item.path
                      .replace(/\d{14}-/g, '')
                      .replace(/\.org/g, '')
                      .replace(/_/g, ' ')}
                  </Link>
                </Text>
              </HStack>
            </Container>
          ))}
        </VStack>
      )}
    </Box>
  )
}
export default CustomSideBar
