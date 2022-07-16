import React, { useEffect, useState } from 'react'
import { List, ListItem } from 'semantic-ui-react';
import { User, Filesystem } from '@daml.js/damlfs-app';
import { userContext } from './App';
import { delay } from '@daml/hub-react/lib/utils';
import { ContractId } from '@daml/types';

type Props = {
    partyToAlias: Map<string, string>
}

type FileTree = {
    contract: string,
    name: string,
    owner: string,
    directories: FileTree[],
    files: Filesystem.File[]
}

/**
 * React component displaying the list of messages for the current user.
 */
const FileTree: React.FC<Props> = ({ partyToAlias }) => {
    const [getFileTreeState, setFileTreeState] = useState<FileTree[]>([]);

    const dirsResult = userContext.useStreamQueries(Filesystem.Directory);
    const filesResult = userContext.useStreamQueries(Filesystem.File);
    console.log(filesResult)
    const dirContractToPayload = dirsResult.contracts.reduce((map, c) => {
        map.set(c.contractId, c.payload!)
        return map
    }, new Map<string, Filesystem.Directory>());

    const fileContractToPayload = filesResult.contracts.reduce((map, c) => {
        map.set(c.contractId, c.payload!)
        return map
    }, new Map<string, Filesystem.File>());


    async function fileTree(contract: string, dir: Filesystem.Directory): Promise<FileTree> {
        const { name, owner, directories, files } = dir;

        const subDirsResult = await Promise.all(directories
            .map(async (d) => await userContext.useLedger().fetch(Filesystem.Directory, d))
        )
        const subDirs = await Promise.all(subDirsResult
            .map(r => [r?.contractId.toString(), r?.payload] as [string, Filesystem.Directory | undefined])
            // .filter((p: Filesystem.Directory | undefined): p is Filesystem.Directory => !!p)
            .map(async ([c, p]) => await fileTree(c, p!)));

        return {
            contract: contract,
            name: name,
            owner: owner,
            directories: subDirs,
            files: await Promise.all(files.map(async (f) => (await userContext.useLedger().fetch(Filesystem.File, f))!.payload)),
        };
    }

    const subDirs = async (dirId: ContractId<Filesystem.Directory>) => {
        const dirResult = await userContext.useLedger().fetch(Filesystem.Directory, dirId)

        return (
            <List relaxed>
                {dirsResult.contracts.map(dir => {
                    const contract = dir.contractId;
                    console.log(contract);
                    const { name, owner, directories, files } = dir.payload;
                    return (
                        <div>
                            <ListItem
                                className='test-select-message-item'
                                key={contract}>
                                <strong>{partyToAlias.get(owner) ?? owner}:</strong> {name}
                                {
                                    directories.map(d => {
                                        const subdir = dirContractToPayload.get(d);
                                        return (
                                            <ListItem>
                                                -- {subdir?.name}
                                            </ListItem>
                                        )
                                    })
                                }
                            </ListItem>
                        </div>
                    );
                })}
            </List>
        );
    };

    const dom = (
        <div>
            <h2>Filetree</h2>
            <List relaxed>
                {dirsResult.contracts.filter(c => c.payload.parent === null).map(dir => {
                    const contract = dir.contractId;
                    console.log(contract);
                    const { name, owner, directories, files } = dir.payload;
                    return (
                        <div>
                            <ListItem
                                className='test-select-message-item'
                                key={contract}>
                                <strong>{partyToAlias.get(owner) ?? owner}:</strong> {name}
                                {
                                    directories.map(d => {
                                        const subdir = dirContractToPayload.get(d);
                                        return (
                                            <ListItem>
                                                -- (d) {subdir?.name}
                                            </ListItem>
                                        )
                                    })
                                }
                                {
                                    files.map(f => {
                                        const file = fileContractToPayload.get(f);
                                        return (
                                            <ListItem>
                                                -- {file?.name} ("{file?.content}")
                                            </ListItem>
                                        )
                                    })
                                }
                            </ListItem>
                        </div>
                    );
                })}
            </List>
        </div>
    )

    return dom

    // useEffect(() => {
    //     const fetch = async () => {
    //         const rootTrees = await Promise.all(dirsResult.contracts.map(c => fileTree(c.contractId.toString(), c.payload)));
    //         // rootTrees.forEach(t => getFileTreeState.push(t));
    //         console.log(rootTrees);
    //         setFileTreeState(rootTrees);
    //     };
    //     fetch();
    // }, []);




    // const loading = <span>Loading...</span>
    // if (getFileTreeState == null) return <div>{loading}</div>
    // return (
    //     <List relaxed>  
    //         {getFileTreeState.map(dir => {
    //             const { contract, name, owner, directories, files } = dir;
    //             return (
    //                 <ListItem
    //                     className='test-select-message-item'
    //                     key={contract}>
    //                     <strong>{partyToAlias.get(owner) ?? owner} &rarr; test:</strong> {name}
    //                 </ListItem>
    //             );
    //         })}
    //     </List>
    // );
};

export default FileTree;