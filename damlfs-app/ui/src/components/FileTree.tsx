import React from 'react'
import { List, ListItem } from 'semantic-ui-react';
import { User, Filesystem } from '@daml.js/damlfs-app';
import { userContext } from './App';

type Props = {
    partyToAlias: Map<string, string>
  }
  /**
   * React component displaying the list of messages for the current user.
   */
  const FileTree: React.FC<Props> = ({partyToAlias}) => {
    const dirsResult = userContext.useStreamQueries(Filesystem.Directory);
  
    return (
      <List relaxed>
        {dirsResult.contracts.map(dir => {
          const {parent, name, owner, directories, files} = dir.payload;
          return (
            <ListItem
              className='test-select-message-item'
              key={dir.contractId}>
              <strong>{partyToAlias.get(owner) ?? owner} &rarr; test:</strong> {name}
            </ListItem>
          );
        })}
      </List>
    );
  };
  
  export default FileTree;