import { ChevronDownIcon, ChevronRightIcon } from '@chakra-ui/icons'
import React, { useEffect } from 'react'

import { Icon, IconButton, useDisclosure, Collapse } from '@chakra-ui/react'
import { MenuLink, CompLink } from './SidebarContent'

export const SidebarSection = (props: any) => {
  const { section } = props
  const subComps = useDisclosure()
  useEffect(() => {
    section.active ? subComps.onOpen() : subComps.onClose()
  }, [section])

  return (
    <>
      <MenuLink
        active={section.active}
        href={section.url}
        section={section}
        subSection={
          section.components.length > 0 && (
            <IconButton
              size="xs"
              isRound
              variant="ghost"
              aria-label={`${section.title} Components`}
              icon={<Icon as={subComps.isOpen ? ChevronDownIcon : ChevronRightIcon} />}
              ml={2}
              onClick={subComps.onToggle}
              _focus={{ shadow: 'none' }}
            />
          )
        }
      >
        <div> {section.title} </div>
      </MenuLink>
      <Collapse in={subComps.isOpen}>
        {section.components?.map((component: any, cid: any) => (
          <CompLink key={`comp-${cid}`} component={component} activeSection={section.active} />
        ))}
      </Collapse>
    </>
  )
}

export default SidebarSection
