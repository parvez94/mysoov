import styled from 'styled-components';

const TextContent = styled.div`
  margin: 20px 0;
`;

const Text = styled.p`
  font-family: var(--secondary-fonts);
  color: var(--secondary-color);
  font-size: 15px;
  letter-spacing: 0.2px;
  line-height: 1.4em;
  word-wrap: break-word;
  overflow-wrap: break-word;
`;

const HomeText = ({ caption }) => {
  return (
    <TextContent>
      <Text>{caption}</Text>
    </TextContent>
  );
};
export default HomeText;
